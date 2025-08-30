import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off", // React 17+에서는 필요 없음
      "react/prop-types": "off", // prop-types를 사용하지 않음
      "no-unused-vars": "warn", // 사용하지 않는 변수를 경고로 변경
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.test.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off", // React 17+에서는 필요 없음
      "react/prop-types": "off", // prop-types를 사용하지 않음
      "no-unused-vars": "warn", // 사용하지 않는 변수를 경고로 변경
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
];
