import type {
  Storage as StorageInterface,
  StorageSetterFunction,
  StorageValueWatcher
} from "@frames.js/render/identity/types"

import { Storage as PlasmoStorage } from "@plasmohq/storage"

export class Storage implements StorageInterface {
  /**
   * Keeps latest values in memory so we don't need to read them every time
   * we set or read the value.
   */
  private values: Map<string, unknown>

  private watchers: Record<string, StorageValueWatcher<any>[]> = {}

  private plasmoStorage: PlasmoStorage

  constructor() {
    this.values = new Map()
    this.watchers = {}
    this.plasmoStorage = new PlasmoStorage()
  }

  get = async <T>(key: string): Promise<T | undefined> => {
    if (this.values.has(key)) {
      return this.values.get(key) as T
    }

    const value = await this.plasmoStorage.get<T>(key)

    if (!value) {
      return undefined
    }

    this.values.set(key, value)

    return Promise.resolve(value)
  }

  set = async <T>(
    key: string,
    setter: StorageSetterFunction<T>
  ): Promise<void> => {
    const currentValue = await this.get<T>(key)
    const newValue = setter(currentValue)

    this.values.set(key, newValue)
    this.notifyChange(key, newValue)

    await this.plasmoStorage.set(key, newValue)
  }

  delete = async (key: string): Promise<void> => {
    this.values.delete(key)

    this.notifyChange(key, undefined)

    await this.plasmoStorage.remove(key)
  }

  watch = <T>(key: string, listener: StorageValueWatcher<T>): (() => void) => {
    this.watchers[key] ??= []
    this.watchers[key]?.push(listener)

    this.get<T>(key)
      .then((value) => {
        listener(value)
      })
      .catch((e) => {
        // eslint-disable-next-line no-console -- provide feedback
        console.error(
          `@frames.js/render: Failed to get value from storage: ${e}`
        )
      })

    return () => {
      const listeners = this.watchers[key]

      if (listeners) {
        this.watchers[key] = listeners.filter((watcher) => watcher !== listener)
      }
    }
  }

  private notifyChange = (key: string, value: unknown): void => {
    this.watchers[key]?.forEach((listener) => {
      listener(value)
    })
  }
}
