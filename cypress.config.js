const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://black-meadow-0048ebf1e.4.azurestaticapps.net/", // Set the base URL
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
});
