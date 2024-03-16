import type {Surreal} from "surrealdb.js";
import {Structure} from "~/interface/structure/Structure";

export const structureExists = async (
  db: Surreal,
  structureId: string,
): Promise<boolean> => {
  const queryResult = (await db.select<Structure>(`${structureId}`)).at(0);
  return !!queryResult;
};
