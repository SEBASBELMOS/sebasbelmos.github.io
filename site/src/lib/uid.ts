// Build-time counter for ids that must be unique within a rendered page.
let n = 0;
export const nextMarkId = () => ++n;
