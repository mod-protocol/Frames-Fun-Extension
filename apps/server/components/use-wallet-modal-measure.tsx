"use client";

import { useEffect, useState } from "react";

function getWcmModalRoot(document: Document | undefined): Element | null {
  const rootNode = document?.querySelector("wcm-modal");
  return rootNode || null;
}
function getWcmModal(document: Document | undefined): Element | null {
  const rootNode = getWcmModalRoot(document);
  if (!rootNode) {
    return null;
  }
  const activeWcmModal = rootNode.shadowRoot?.querySelector(
    "#wcm-modal.wcm-active"
  );
  return activeWcmModal || null;
}

function getModal(document: Document): Element | null {
  const modal = document.querySelector('[data-rk] [role="document"]');
  return modal || null;
}

function useElement(
  targetNode: Element | null | undefined,
  selectElement: (document: Document) => Element | null,
  observerConfig?: MutationObserverInit
): [Element | null] {
  const [modal, setModal] = useState<Element | null>(null);
  useEffect(() => {
    if (!targetNode) {
      return;
    }
    function callback() {
      setModal(selectElement(document));
    }

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, observerConfig ?? { childList: true });

    return () => {
      observer.disconnect();
    };
  }, [targetNode, selectElement, observerConfig, setModal]);
  return [modal];
}

export function useWalletModalMeasure() {
  const [doc, setDoc] = useState<Document | null>(null);
  const [wcmRoot] = useElement(doc?.body, getWcmModalRoot);
  const wcmModalElement = wcmRoot?.shadowRoot?.querySelector("#wcm-modal");
  const [wcmModal] = useElement(wcmModalElement, getWcmModal, {
    attributes: true,
  });
  const [modal] = useElement(doc?.body, getModal);

  useEffect(() => setDoc(document), [setDoc]);

  const [modalSize] = useElementMeasure(modal);
  const [wcmModalSize] = useElementMeasure(
    wcmModal?.querySelector(".wcm-container") || null
  );

  return [modalSize || wcmModalSize || null];
}

interface ElementSize {
  width: number;
  height: number;
}

function useElementMeasure(element: Element | null) {
  const [size, setElementSize] = useState<ElementSize | null>(null);
  useEffect(() => {
    if (!element) {
      setElementSize(null);
      return;
    }
    const modalResizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setElementSize({ width, height });
      }
    });
    modalResizeObserver.observe(element);
    return () => {
      modalResizeObserver.disconnect();
    };
  }, [element, setElementSize]);

  return [size];
}
