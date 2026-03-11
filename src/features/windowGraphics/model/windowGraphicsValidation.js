export function validateWindowGraphicsInput(input) {
  const errors = [];

  if (!input.size) errors.push('Size is required.');
  if (!input.material) errors.push('Material is required.');
  if (!input.installSurface) errors.push('Install surface is required.');
  if (!input.laminate) errors.push('Laminate selection is required.');
  if (!input.turnaround) errors.push('Turnaround is required.');

  const qty = Number(input.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
    errors.push('Quantity must be an integer between 1 and 10000.');
  }

  return errors;
}
