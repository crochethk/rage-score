import { useCallback, useMemo, useState } from "react";

export interface DialogState<DataT> {
  /**
   * The dialog data for consumption while the dialog `isOpen` and provided by
   * the `open` function.
   */
  readonly data: DataT | undefined;
  /** Whether the dialog is open. */
  readonly isOpen: boolean;
  /** Function to open the dialog using the provided dialog data. */
  readonly open: (data: DataT) => void;
  /** Function to close the dialog. */
  readonly close: () => void;
}

/**
 * Custom hook to manage the state of a dialog.
 * @param DataT The type of data associated with the dialog. Use `null` if no data is needed.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function useDialogState<DataT extends {} | null>(): DialogState<DataT> {
  const [data, setData] = useState<DataT | undefined>(undefined);
  const open = useCallback((data: DataT) => setData(data), []);
  const close = useCallback(() => setData(undefined), []);

  const isOpen = data !== undefined;

  return useMemo(
    () => ({
      data,
      isOpen,
      open,
      close,
    }),
    [close, data, isOpen, open],
  );
}
