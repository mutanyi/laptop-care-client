import js from "@eslint/js";
export default [
  js.configs.recommended,
  {
    // your rules and settings here
    rules: {
      // Example:
      "no-unused-vars": "warn",
    },
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"] // specify files directly
  }
];