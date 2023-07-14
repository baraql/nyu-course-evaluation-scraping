async function getComboboxOptions(comboboxLocator) {
  // wait for the combobox to become enabled
  await comboboxLocator.click({ trial: true });

  const options = await comboboxLocator
    .getByRole("option")
    .evaluateAll((options) => {
      return options.map((option) => {
        return option.getAttribute("value");
      });
    });

  // console.log(JSON.stringify(options));

  // first value is always the default unselected option e.g. "XX"
  return options.slice(1);
}

module.exports = { getComboboxOptions };
