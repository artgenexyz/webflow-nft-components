export const NETWORKS = {
    1: {
        name: "Ethereum",
        rpcURL: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        testnetID: 4,
        blockExplorerURL: "https://etherscan.io"
    },
    4: {
        name: "Rinkeby",
        rpcURL: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        testnetID: 4,
        blockExplorerURL: "https://rinkeby.etherscan.io"
    },
    137: {
        name: "Polygon",
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
        rpcURL: "https://data-seed-prebsc-1-s1.binance.org:8545",
        currency: {
            name: "Binance Coin",
            symbol: "tBNB",
            decimals: 18,
        },
        testnetID: 97,
        blockExplorerURL: "https://testnet.bscscan.com",
    },
    250: {
        name: "Fantom Opera",
        rpcURL: "https://rpc.ftm.tools/",
        currency: {
            name: "Fantom",
            symbol: "FTM",
            decimals: 18,
        },
        testnetID: 250,
        blockExplorerURL: "https://ftmscan.com",
    },    
    1285: {
        name: "Moonriver",
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
        rpcURL: "https://rpc.testnet.moonbeam.network",
        currency: {
            name: "DEV",
            symbol: "DEV",
            decimals: 18,
        },
        testnetID: 1287,
        blockExplorerURL: "https://moonbase-blockscout.testnet.moonbeam.network"
    }
}

export const getBaseURL = () => {
    if (window.location.href.includes("localhost")) {
        return "http://localhost:3000"
    }
    return "https://nftcomponents.vercel.app"
}
