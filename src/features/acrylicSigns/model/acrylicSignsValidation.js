export function validateAcrylicSignsInput(input) {
  const errors = [];

  if (!input.size) errors.push('Size is required.');
  if (!input.thickness) errors.push('Thickness is required.');
  if (!input.printStyle) errors.push('Print style is required.');
  if (!input.mounting) errors.push('Mounting option is required.');
  if (!input.turnaround) errors.push('Turnaround is required.');

  const qty = Number(input.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 5000) {
    errors.push('Quantity must be an integer between 1 and 5000.');
  }

  return errors;
}
