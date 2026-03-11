export function validatePvcSignsInput(input) {
  const errors = [];

  if (!input.size) errors.push('Size is required.');
  if (!input.thickness) errors.push('Thickness is required.');
  if (!input.sides) errors.push('Print sides are required.');
  if (!input.finishing) errors.push('Finishing is required.');
  if (!input.turnaround) errors.push('Turnaround is required.');

  const qty = Number(input.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
    errors.push('Quantity must be an integer between 1 and 10000.');
  }

  return errors;
}
