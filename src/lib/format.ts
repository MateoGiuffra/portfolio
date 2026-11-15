// Número con cero a la izquierda a 2 dígitos (01, 02, ...).
export const pad2 = (n: number): string => String(n).padStart(2, '0')
