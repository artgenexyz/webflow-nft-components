export const NETWORKS = {
    1: {
        name: "Ethereum",
        chain: "ethereum",
        rpcURL: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        testnetID: 5,
        blockExplorerURL: "https://etherscan.io"
    },
    4: {
        name: "Rinkeby",
        chain: "ethereum",
        rpcURL: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        testnetID: 4,
        blockExplorerURL: "https://rinkeby.etherscan.io"
    },
    5: {
        name: "Goerli",
        chain: "ethereum",
        rpcURL: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        testnetID: 5,
        blockExplorerURL: "https://goerli.etherscan.io"
    },
    10: {
        name: "Optimism",
        chain: "ethereum",
        rpcURL: "https://mainnet.optimism.io/",
        currency: {
            "name": "Ether",
            "symbol": "ETH",
            "decimals": 18
        },
        testnetID: 420,
        blockExplorerURL: "https://optimistic.etherscan.io"
    },
    420: {
        name: "Optimism Goerli",
        chain: "ethereum",
        rpcURL: "https://goerli.optimism.io/",
        currency: {
            "name": "Goerli Ether",
            "symbol": "ETH",
            "decimals": 18
        },
        testnetID: 420,
        blockExplorerURL: "https://goerli-optimism.etherscan.io"
    },
    42161: {
        name: "Arbitrum One",
        chain: "ethereum",
        currency: {
            "name": "Ether",
            "symbol": "ETH",
            "decimals": 18
        },
        testnetID: 421613,
        rpcURL: "https://arb1.arbitrum.io/rpc/",
        blockExplorerURL: "https://arbiscan.io",
    },
    421613: {
        "name": "Arbitrum Görli",
        "chain": "ethereum",
        currency: {
            "name": "Goerli Ether",
            "symbol": "ETH",
            "decimals": 18
        },
        testnetID: 421613,
        rpcURL: "https://goerli-rollup.arbitrum.io/rpc/",
        blockExplorerURL: "https://goerli.arbiscan.io"
    },
    137: {
        name: "Polygon",
        chain: "polygon",
        rpcURL: "https://polygon-rpc.com/",
        currency: {
            name: "Matic",
            symbol: "MATIC",
            decimals: 18
        },
        testnetID: 80001,
        blockExplorerURL: "https://polygonscan.com"
    },
    80001: {
        name: "Mumbai (Polygon Testnet)",
        chain: "polygon",
        rpcURL: "https://rpc-mumbai.maticvigil.com/",
        currency: {
            name: "Matic",
            symbol: "MATIC",
            decimals: 18
        },
        testnetID: 80001,
        blockExplorerURL: "https://mumbai.polygonscan.com"
    },
    56: {
        name: "Binance",
        chain: "binance",
        rpcURL: "https://bsc-dataseed1.binance.org",
        currency: {
            name: "Binance Coin",
            symbol: "BNB",
            decimals: 18,
        },
        testnetID: 97,
        blockExplorerURL: "https://bscscan.com",
    },
    97: {
        name: "Binance Smart Chain Testnet",
        chain: "binance",
        rpcURL: "https://data-seed-prebsc-1-s1.binance.org:8545",
        currency: {
            name: "Binance Coin",
            symbol: "tBNB",
            decimals: 18,
        },
        testnetID: 97,
        blockExplorerURL: "https://testnet.bscscan.com",
    },
    43114: {
        name: "Avalanche",
        chain: "AVAX",
        rpcURL: "https://api.avax.network/ext/bc/C/rpc/",
        currency: {
            "name": "Avalanche",
            "symbol": "AVAX",
            "decimals": 18
        },
        testnetID: 43113,
        blockExplorerURL: "https://snowtrace.io"
    },
    43113: {
        name: "Avalanche Fuji",
        chain: "AVAX",
        rpcURL: "https://api.avax-test.network/ext/bc/C/rpc/",
        currency: {
            "name": "Avalanche",
            "symbol": "AVAX",
            "decimals": 18
        },
        testnetID: 43113,
        blockExplorerURL: "https://cchain.explorer.avax-test.network"
    },
    25: {
        name: "Cronos Blockchain",
        chain: "cronos",
        rpcURL: "https://evm-cronos.crypto.org",
        currency: {
            name: "Cronos",
            symbol: "CRO",
            decimals: 18,
        },
        testnetID: 338,
        blockExplorerURL: "https://cronos.crypto.org/explorer/",
    },
    338: {
        name: "Cronos Testnet",
        chain: "cronos",
        rpcURL: "https://cronos-testnet-3.crypto.org:8545/",
        currency: {
            name: "Cronos",
            symbol: "tCRO",
            decimals: 18,
        },
        testnetID: 338,
        blockExplorerURL: "https://cronos.crypto.org/explorer/testnet3/",
    },
    1285: {
        name: "Moonriver",
        chain: "moonriver",
        rpcURL: "https://rpc.moonriver.moonbeam.network",
        currency: {
            name: "MOVR",
            symbol: "MOVR",
            decimals: 18,
        },
        testnetID: 1287,
        blockExplorerURL: "https://blockscout.moonriver.moonbeam.network"
    },
    1287: {
        name: "Moonbase Alpha",
        chain: "moonriver",
        rpcURL: "https://rpc.testnet.moonbeam.network",
        currency: {
            name: "DEV",
            symbol: "DEV",
            decimals: 18,
        },
        testnetID: 1287,
        blockExplorerURL: "https://moonbase-blockscout.testnet.moonbeam.network"
    },
    40: {
        name: "Telos Mainnet",
        chain: "telos",
        rpcURL: "https://rpc1.us.telos.net/evm",
        currency: {
            name: "TLOS",
            symbol: "TLOS",
            decimals: 18,
        },
        testnetID: 41,
        blockExplorerURL: "https://teloscan.io"
    },
    41: {
        name: "Telos Testnet",
        chain: "telos",
        rpcURL: "https://testnet.telos.net/evm",
        currency: {
            name: "TLOS",
            symbol: "TLOS",
            decimals: 18,
        },
        testnetID: 41,
        blockExplorerURL: "https://testnet.teloscan.io"
    }
}

export const getBaseURL = () => {
    if (window.location.href.includes("localhost")) {
        return window.location.origin
    }
    return "https://nftcomponents.vercel.app"
}
