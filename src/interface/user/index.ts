import { type Surreal } from "surrealdb.js";
import { z } from "@builder.io/qwik-city";

export const CreateUserIfNotExistsResult = z.object({
  id: z.string(),
});
export type CreateUserIfNotExistsResult = z.infer<
  typeof CreateUserIfNotExistsResult
>;

const GetUserByAddressQuery =
  "SELECT ->auth_account.out FROM address WHERE value = type::string($address)";
const GetUserByAddressValidator = z.array(
  z.object({
    "->auth_account": z.object({ out: z.array(z.string()) }),
  }),
);

const CreateAddressQuery =
  "CREATE ONLY address SET value = type::string($address)";
const CreateAddressValidator = z.array(
  z.object({ id: z.string(), value: z.string() }),
);

const CreateUserQuery = "CREATE ONLY user";
const CreateUserValidator = z.array(z.object({ id: z.string() }));

const RelateAddressToUserQuery =
  "RELATE ONLY $address_id->auth_account->$user_id";
const RelateAddressToUserValidator = z.array(
  z.object({ id: z.string(), in: z.string(), out: z.string() }),
);

export const createUserIfNotExists = async (db: Surreal, address: string) => {
  const getUserByAddressUncheckedResult = (
    await db.query(GetUserByAddressQuery, {
      address,
    })
  ).at(0);

  if (
    getUserByAddressUncheckedResult instanceof Array &&
    getUserByAddressUncheckedResult.length > 0
  ) {
    const getUserByAddressResult = GetUserByAddressValidator.parse(
      getUserByAddressUncheckedResult,
    );
    return getUserByAddressResult.at(0)?.["->auth_account"].out.at(0);
  } else {
    const createAddressResult = CreateAddressValidator.parse(
      await db.query(CreateAddressQuery, {
        address,
      }),
    ).at(0);

    const createUserResult = CreateUserValidator.parse(
      await db.query(CreateUserQuery),
    ).at(0);

    if (
      !createAddressResult ||
      !createAddressResult.id ||
      !createUserResult ||
      !createUserResult.id
    ) {
      throw new Error("Failed to create user or address");
    }

    const relateAddressToUserResult = RelateAddressToUserValidator.parse(
      await db.query(RelateAddressToUserQuery, {
        address_id: createAddressResult.id,
        user_id: createUserResult.id,
      }),
    ).at(0);

    return relateAddressToUserResult?.out;
  }
};
