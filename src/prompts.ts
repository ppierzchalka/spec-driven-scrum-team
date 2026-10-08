import { select as choose, input, search, confirm as askConfirm, checkbox as check } from '@inquirer/prompts';

interface Option<Value> { value: Value; label?: string; hint?: string }
export class SetupCancelledError extends Error {
  override name = 'SetupCancelledError';
  constructor() { super('Cancelled.'); }
}
export async function promptResult<T>(run: () => Promise<T>): Promise<T | symbol> {
  try { return await run(); } catch (error) {
    if (error instanceof Error && ['ExitPromptError', 'AbortPromptError'].includes(error.name)) throw new SetupCancelledError();
    throw error;
  }
}
/** Adapt option data only; rendering, navigation, filtering and terminal cleanup belong to Inquirer. */
export function select<Value>(options: { message: string; options: Option<Value>[] }): Promise<Value | symbol> {
  return promptResult(() => choose({ message: options.message, choices: options.options.map(option => ({ value: option.value, name: option.label, description: option.hint })) }));
}
export function checkbox<Value>(options: { message: string; options: (Option<Value> & { checked?: boolean })[] }): Promise<Value[] | symbol> {
  return promptResult(() => check({ message: options.message, choices: options.options.map(option => ({ value: option.value, name: option.label, description: option.hint, checked: option.checked })) }));
}
export function autocomplete<Value>(options: { message: string; options: Option<Value>[]; placeholder?: string }): Promise<Value | symbol> {
  return promptResult(() => search({ message: options.message, source: term => options.options
    .filter(option => !term || `${option.label ?? option.value} ${option.hint ?? ''}`.toLowerCase().includes(term.toLowerCase()))
    .map(option => ({ value: option.value, name: option.label, description: option.hint })) }));
}
export function text(options: { message: string; initialValue?: string; validate?: (value: string) => string | undefined }): Promise<string | symbol> {
  return promptResult(() => input({ message: options.message, default: options.initialValue, validate: value => options.validate?.(value) ?? true }));
}
export function confirm(options: { message: string; initialValue?: boolean }): Promise<boolean | symbol> {
  return promptResult(() => askConfirm({ message: options.message, default: options.initialValue }));
}
export function note(message: string, title?: string): void { console.log(title ? `\n${title}\n${message}\n` : `\n${message}\n`); }
export function intro(message: string): void { console.log(`\n${message}\n`); }
export function outro(message: string): void { console.log(`\n${message}`); }
export function cancel(message: string): void { console.log(message); }
