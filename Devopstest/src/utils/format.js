export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'validation failed';

  if (Array.isArray(errors.issues)) return JSON.stringify(errors);

  return JSON.stringify(errors);
};
