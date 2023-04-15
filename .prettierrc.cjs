module.exports = {
  printWidth: 109,
  tabWidth: 2,
  importOrder: ["<THIRD_PARTY_MODULES>", "^(@ts-ghost/(.*)$)|^(remix$)", "", "^[./]", "^types$"],
  importOrderBuiltinModulesToTop: true,
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  plugins: [require("@ianvs/prettier-plugin-sort-imports")],
};
