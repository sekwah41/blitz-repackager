
module.exports = {
    appId: `com.sekwah.blitz-repackager`,
    productName: `Blitz`,
    remoteBuild: false,
    directories: {
        buildResources: "app"
    },
    files: [
        "electron-src/**/*",
        "resources/**",
    ],
    linux: {
        icon: "resources/icons/",
        category: "Game",
        publish: ["github"],
        desktop: {
            "Name": "Blitz",
        },
        target: [
            "AppImage",
            "deb",
            "rpm",
            "snap"
        ]
    }
}
