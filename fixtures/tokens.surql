DEFINE TABLE token SCHEMALESS;
DEFINE FIELD address ON TABLE token TYPE string;
DEFINE FIELD symbol ON TABLE token TYPE string;
DEFINE FIELD name ON TABLE token TYPE string;
DEFINE FIELD decimals ON TABLE token TYPE string;
DEFINE INDEX tokenAddressIndex ON TABLE token COLUMNS address UNIQUE;
CREATE token SET address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol = 'WETH', name = 'WETH', decimals = '18';
CREATE token SET address = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol = 'WBTC', name = 'WBTC', decimals = '18';
CREATE token SET address = '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol = 'USDT', name = 'USDT', decimals = '6';
CREATE token SET address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol = 'USDC', name = 'USDC', decimals = '6';

DEFINE TABLE balance SCHEMALESS;
DEFINE FIELD value ON TABLE balance type string;
