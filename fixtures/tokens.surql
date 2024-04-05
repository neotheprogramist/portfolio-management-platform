DEFINE TABLE token SCHEMALESS;
DEFINE FIELD address ON TABLE token TYPE string;
DEFINE FIELD symbol ON TABLE token TYPE string;
DEFINE FIELD name ON TABLE token TYPE string;
DEFINE FIELD decimals ON TABLE token TYPE string;
DEFINE FIELD imagePath ON TABLE token type string;
DEFINE FIELD priceUSD ON TABLE token TYPE string;
DEFINE INDEX tokenAddressIndex ON TABLE token COLUMNS address UNIQUE;
CREATE token SET address = '0x054E1324CF61fe915cca47C48625C07400F1B587', symbol = 'GLM', name = 'Golem', decimals = '16', imagePath = "/public/assets/icons/tokens/wbtc.svg", priceUSD = '0.53';
CREATE token SET address = '0xD418937d10c9CeC9d20736b2701E506867fFD85f', symbol = 'USDC', name = 'USDC', decimals = '16', imagePath = "/public/assets/icons/tokens/usdc.svg", priceUSD = '1.00';
CREATE token SET address = '0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709', symbol = 'USDT', name = 'USDT', decimals = '16', imagePath = "/public/assets/icons/tokens/usdt.svg", priceUSD = '1.00';

DEFINE TABLE balance SCHEMALESS;
DEFINE FIELD value ON TABLE balance type string;
