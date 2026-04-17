import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  buildCartItemKey,
  calculateMayoreoUnitTotal,
  calculatePiecePrice,
  getPiecesFromPresentationLabel,
  type PurchaseType,
} from "@/lib/commerce";
import type { AddFlyingItemFn, AddToCartFn, Concentration, Product } from "./types";
import {
  clampQuantity,
  getPresentationOptions,
  getProductBadgeNote,
  getProductDescription,
  getProductHighlights,
  isPieceEligibleLabel,
} from "./utils";

type ProductCardProps = {
  product: Product;
  addToCart: AddToCartFn;
  addFlyingItem: AddFlyingItemFn;
};

const ProductCard = React.memo(function ProductCard({
  product,
  addToCart,
  addFlyingItem,
}: ProductCardProps) {
  const { toast } = useToast();
  const availableConcentrations = useMemo(
    () => (["125", "250"] as Concentration[]).filter((value) => {
      const options = getPresentationOptions(product, value);
      return options.length > 0;
    }),
    [product],
  );
  const [selectedConcentration, setSelectedConcentration] =
    useState<Concentration>(availableConcentrations[0] || "125");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("mayoreo");
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [wholesaleQuantity, setWholesaleQuantity] = useState(1);
  const [selectedWholesalePieces, setSelectedWholesalePieces] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!availableConcentrations.includes(selectedConcentration)) {
      setSelectedConcentration(availableConcentrations[0] || "125");
      setSelectedIdx(0);
    }
  }, [availableConcentrations, selectedConcentration]);

  const availablePresentations = useMemo(
    () => getPresentationOptions(product, selectedConcentration),
    [product, selectedConcentration],
  );
  const pieceReferencePresentation = useMemo(
    () =>
      availablePresentations.find((presentation) =>
        isPieceEligibleLabel(presentation.label),
      ) ?? availablePresentations[0],
    [availablePresentations],
  );

  useEffect(() => {
    setSelectedIdx(0);
    setPieceQuantity(1);
    setWholesaleQuantity(1);
  }, [selectedConcentration]);

  const selected = useMemo(
    () => availablePresentations[selectedIdx] ?? availablePresentations[0],
    [availablePresentations, selectedIdx],
  );
  const piecesPerBoxFromPresentation = useMemo(
    () => (selected ? getPiecesFromPresentationLabel(selected.label) : null),
    [selected],
  );
  const specialWholesaleBoxes = useMemo(
    () => product.specialWholesaleBoxes?.[selectedConcentration] || [],
    [product.specialWholesaleBoxes, selectedConcentration],
  );
  const wholesalePiecesOptions = useMemo(() => {
    if (specialWholesaleBoxes.length > 0) {
      return specialWholesaleBoxes;
    }

    if (piecesPerBoxFromPresentation) {
      return [piecesPerBoxFromPresentation];
    }

    return [];
  }, [piecesPerBoxFromPresentation, specialWholesaleBoxes]);

  useEffect(() => {
    const defaultWholesalePieces = wholesalePiecesOptions[0] ?? null;
    setSelectedWholesalePieces(defaultWholesalePieces);
  }, [wholesalePiecesOptions]);

  const priceBase = selected?.price ?? 0;
  const piecePriceBase = pieceReferencePresentation?.price ?? 0;
  const isOnlyWholesale = Boolean(product.onlyWholesale);
  const isPieceEligiblePresentation =
    Boolean(pieceReferencePresentation) &&
    (isPieceEligibleLabel(pieceReferencePresentation?.label) ||
      specialWholesaleBoxes.length > 0);
  const allowsPiece =
    !isOnlyWholesale && piecePriceBase > 0 && isPieceEligiblePresentation;
  const allowsMayoreo = priceBase > 0;

  useEffect(() => {
    if (isOnlyWholesale && purchaseType !== "mayoreo") {
      setPurchaseType("mayoreo");
      return;
    }

    if (purchaseType === "pieza" && !allowsPiece) {
      setPurchaseType("mayoreo");
      return;
    }

    if (purchaseType === "mayoreo" && !allowsMayoreo) {
      setPurchaseType("pieza");
    }
  }, [allowsMayoreo, allowsPiece, isOnlyWholesale, purchaseType]);

  const notAvailable = useMemo(
    () => availablePresentations.length === 0,
    [availablePresentations.length],
  );
  const productDescription = useMemo(
    () => getProductDescription(product),
    [product],
  );
  const productNoteLabel = useMemo(
    () => getProductBadgeNote(product),
    [product],
  );
  const productHighlights = useMemo(
    () => getProductHighlights(product),
    [product],
  );
  const piecePrice = useMemo(
    () => calculatePiecePrice(piecePriceBase),
    [piecePriceBase],
  );
  const wholesaleUnitTotal = useMemo(
    () => calculateMayoreoUnitTotal(priceBase, selectedWholesalePieces),
    [priceBase, selectedWholesalePieces],
  );
  const currentSubtotal =
    purchaseType === "pieza"
      ? piecePrice * pieceQuantity
      : wholesaleUnitTotal * wholesaleQuantity;

  const handleAddToCart = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!selected || priceBase <= 0) {
        return;
      }

      if (purchaseType === "mayoreo" && !allowsMayoreo) {
        toast({
          title: "Compra no disponible",
          description:
            "Esta presentación no admite mayoreo por caja en la configuración actual.",
          variant: "destructive",
        });
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top;
      const effectiveQuantity =
        purchaseType === "pieza" ? pieceQuantity : wholesaleQuantity;
      const effectivePiecesPerBox =
        purchaseType === "mayoreo" ? selectedWholesalePieces : null;
      const effectiveUnitPrice =
        purchaseType === "pieza" ? piecePrice : wholesaleUnitTotal;
      const effectivePriceBase =
        purchaseType === "pieza" ? piecePriceBase : priceBase;
      const effectiveSubtotal = effectiveUnitPrice * effectiveQuantity;

      addFlyingItem({
        productId: product.id,
        imageUrl: undefined,
        hexCode: product.hex,
        startX,
        startY,
      });

      addToCart({
        cartKey: buildCartItemKey({
          productId: product.id,
          concentration: selectedConcentration,
          size: selected.label,
          purchaseType,
          piecesPerBox: effectivePiecesPerBox,
        }),
        productId: product.id,
        productName: `${product.name} C-${selectedConcentration}`,
        size: selected.label,
        price: effectiveUnitPrice,
        quantity: effectiveQuantity,
        hexCode: product.hex,
        concentration: selectedConcentration,
        purchaseType,
        priceBase: effectivePriceBase,
        unitPrice: effectiveUnitPrice,
        subtotal: effectiveSubtotal,
        piecesPerBox: effectivePiecesPerBox,
        quantityBoxes:
          purchaseType === "mayoreo" ? effectiveQuantity : undefined,
        totalPieces:
          purchaseType === "mayoreo" && effectivePiecesPerBox
            ? effectivePiecesPerBox * effectiveQuantity
            : effectiveQuantity,
        warningMessage: product.purchaseWarning,
      });
    },
    [
      addFlyingItem,
      addToCart,
      allowsMayoreo,
      piecePrice,
      piecePriceBase,
      pieceQuantity,
      priceBase,
      product,
      purchaseType,
      selected,
      selectedConcentration,
      selectedWholesalePieces,
      toast,
      wholesaleQuantity,
      wholesaleUnitTotal,
    ],
  );

  return (
    <motion.div
      layout
      className="relative h-full overflow-hidden rounded-[26px] border border-white/80 bg-[radial-gradient(circle_at_top,rgba(255,208,74,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,249,255,0.98)_100%)] transition-all duration-300 will-change-transform hover:-translate-y-1 min-[480px]:rounded-[28px] lg:min-h-[640px]"
      style={{
        boxShadow:
          "0 18px 50px rgba(15,23,42,0.10), 0 2px 10px rgba(15,23,42,0.05)",
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ backgroundColor: product.hex }}
      />

      <div
        className="h-[8px] w-full"
        style={{
          background: `linear-gradient(90deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
        }}
      />

      <div className="relative flex h-full flex-col p-4 min-[400px]:p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-500 shadow-sm min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-[9px]">
            {product.category}
          </span>
          {(product.industrial || productNoteLabel) && (
            <span className="inline-flex rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 shadow-sm min-[400px]:px-3 min-[400px]:py-1.5 min-[400px]:text-[9px]">
              {product.industrial ? "Industrial" : productNoteLabel}
            </span>
          )}
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 min-[400px]:mt-5 min-[400px]:gap-5">
          <div className="grid min-h-[112px] items-center gap-3 min-[500px]:grid-cols-[92px_minmax(0,1fr)] min-[500px]:gap-5 min-[400px]:min-h-[126px]">
            <div
              className="mx-auto mt-1 h-[68px] w-[68px] shrink-0 rounded-full border-[4px] border-white shadow-[0_16px_28px_rgba(255,205,0,0.22)] min-[400px]:h-[78px] min-[400px]:w-[78px] min-[500px]:h-[92px] min-[500px]:w-[92px]"
              style={{
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), transparent 28%), linear-gradient(135deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
                boxShadow: `0 12px 28px ${product.hex}36`,
              }}
            />
            <div className="min-w-0 text-center min-[500px]:text-left">
              <h3 className="text-[1.4rem] font-black leading-[0.94] tracking-tight text-[#0b2d6b] min-[400px]:text-[1.65rem] min-[500px]:text-[2.05rem]">
                {product.name}
              </h3>
              <p className="mx-auto mt-2 max-w-sm min-h-[2.6rem] overflow-hidden text-[12px] leading-relaxed text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] min-[400px]:mt-2.5 min-[400px]:min-h-[3rem] min-[400px]:text-[13px] min-[500px]:mx-0 min-[500px]:text-[14px]">
                {productDescription}
              </p>
            </div>
          </div>

          <div className="grid min-h-[86px] grid-cols-1 gap-2 min-[400px]:gap-2.5 min-[500px]:grid-cols-2">
            {productHighlights.slice(0, 3).map((highlight, index) => (
              <span
                key={`${product.id}-${highlight}`}
                className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm min-[400px]:gap-1.5 min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-[11px] min-[500px]:justify-start ${
                  index === 2 ? "min-[500px]:col-span-1" : ""
                }`}
              >
                {index === 0 ? (
                  <Star
                    size={12}
                    className="shrink-0 fill-[#FFCD00] text-[#FFCD00]"
                  />
                ) : index === 1 ? (
                  <CheckCircle size={12} className="shrink-0 text-[#E0B100]" />
                ) : (
                  <CheckCircle size={12} className="shrink-0 text-[#5b6b8c]" />
                )}
                <span className="truncate text-center min-[500px]:text-left">
                  {highlight}
                </span>
              </span>
            ))}
          </div>
        </div>

        {notAvailable ? (
          <div className="mt-auto flex min-h-[168px] items-center py-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              No disponible en la concentración seleccionada. Elige otra si está
              disponible.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-auto rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] min-[400px]:rounded-[24px] min-[400px]:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Elige concentración
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {availableConcentrations.map((value) => {
                  const isActive = selectedConcentration === value;
                  return (
                    <button
                      key={`selector-${value}`}
                      type="button"
                      onClick={() => setSelectedConcentration(value)}
                      className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition-all min-[400px]:px-4 min-[400px]:text-[11px] ${
                        isActive
                          ? "bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/20"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      C-{value}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-200/80 pt-4 min-[400px]:mt-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    {isOnlyWholesale && wholesalePiecesOptions.length > 1
                      ? "Elige caja"
                      : "Elige presentación"}
                  </p>
                  <span className="rounded-full bg-[#0b2d6b]/6 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b2d6b]">
                    C-{selectedConcentration}
                  </span>
                </div>
              </div>

              {isOnlyWholesale && wholesalePiecesOptions.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2 min-[400px]:mt-4">
                  {wholesalePiecesOptions.map((pieces) => {
                    const isActive = selectedWholesalePieces === pieces;
                    return (
                      <button
                        key={`${product.id}-box-${pieces}`}
                        type="button"
                        onClick={() => setSelectedWholesalePieces(pieces)}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          isActive
                            ? "bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/20"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        Caja de {pieces} piezas
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative mt-3 min-[400px]:mt-4">
                  <select
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-xs font-semibold text-gray-700 shadow-sm transition-all focus:border-[#003F91]/30 focus:outline-none focus:ring-2 focus:ring-[#003F91]/15 min-[400px]:py-3 min-[400px]:text-sm"
                    value={selectedIdx}
                    onChange={(event) => setSelectedIdx(Number(event.target.value))}
                  >
                    {availablePresentations.map((presentation, index) => (
                      <option key={presentation.label} value={index}>
                        {presentation.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              )}

              <div className="mt-4 space-y-4 min-[400px]:mt-5">
                <div
                  className={`grid gap-2 ${allowsPiece ? "sm:grid-cols-2" : "grid-cols-1"}`}
                >
                  {allowsPiece ? (
                    <button
                      type="button"
                      onClick={() => setPurchaseType("pieza")}
                      disabled={!allowsPiece}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        purchaseType === "pieza"
                          ? "border-[#0b2d6b] bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/15"
                          : "border-slate-200 bg-white text-slate-700"
                      } ${!allowsPiece ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]">
                        Precio por pieza
                      </p>
                      <p className="mt-2 text-lg font-black">
                        ${piecePrice.toLocaleString("es-MX")}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          purchaseType === "pieza"
                            ? "text-white/75"
                            : "text-slate-500"
                        }`}
                      ></p>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setPurchaseType("mayoreo")}
                    disabled={!allowsMayoreo}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      purchaseType === "mayoreo"
                        ? "border-[#0b2d6b] bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/15"
                        : "border-slate-200 bg-white text-slate-700"
                    } ${!allowsMayoreo ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]">
                      Compra por mayoreo
                    </p>
                    <p className="mt-2 text-lg font-black">
                      $
                      {(
                        selectedWholesalePieces
                          ? calculateMayoreoUnitTotal(
                              priceBase,
                              selectedWholesalePieces,
                            )
                          : priceBase
                      ).toLocaleString("es-MX")}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        purchaseType === "mayoreo"
                          ? "text-white/75"
                          : "text-slate-500"
                      }`}
                    >
                      {selectedWholesalePieces
                        ? `Total por caja de ${selectedWholesalePieces} piezas`
                        : "Total por volumen"}
                    </p>
                  </button>
                </div>

                {product.purchaseWarning ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                    {product.purchaseWarning}
                  </div>
                ) : null}

                {purchaseType === "mayoreo" &&
                specialWholesaleBoxes.length > 1 &&
                !isOnlyWholesale ? (
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Caja de mayoreo
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {specialWholesaleBoxes.map((pieces) => {
                        const isActive = selectedWholesalePieces === pieces;
                        return (
                          <button
                            key={`${product.id}-${pieces}`}
                            type="button"
                            onClick={() => setSelectedWholesalePieces(pieces)}
                            className={`rounded-full px-3.5 py-2 text-[11px] font-bold transition ${
                              isActive
                                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-200"
                                : "border border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            Caja de {pieces} piezas
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3">
                  <div className="relative z-10">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                      {purchaseType === "pieza"
                        ? "Cantidad de piezas"
                        : selectedWholesalePieces
                          ? "Cantidad de cajas"
                          : "Cantidad"}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                      <button
                        type="button"
                        onClick={() =>
                          purchaseType === "pieza"
                            ? setPieceQuantity((current) =>
                                clampQuantity(current - 1),
                              )
                            : setWholesaleQuantity((current) =>
                                clampQuantity(current - 1),
                              )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[3rem] text-center text-lg font-black text-[#0b2d6b]">
                        {purchaseType === "pieza" ? pieceQuantity : wholesaleQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          purchaseType === "pieza"
                            ? setPieceQuantity((current) =>
                                clampQuantity(current + 1),
                              )
                            : setWholesaleQuantity((current) =>
                                clampQuantity(current + 1),
                              )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {purchaseType === "pieza"
                        ? `${pieceQuantity} ${pieceQuantity === 1 ? "pieza" : "piezas"}`
                        : selectedWholesalePieces
                          ? `${wholesaleQuantity} ${wholesaleQuantity === 1 ? "caja" : "cajas"} de ${selectedWholesalePieces} piezas`
                          : `${wholesaleQuantity} volumen`}
                    </p>
                  </div>

                  <div className="min-w-0 px-1 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      {purchaseType === "pieza"
                        ? "Subtotal por pieza"
                        : selectedWholesalePieces
                          ? "Total por caja / volumen"
                          : "Total por volumen"}
                    </span>
                    <div className="mt-1 flex flex-wrap items-end gap-x-1.5 gap-y-1 leading-[0.95]">
                      <span className="break-all text-[1.45rem] font-bold tracking-tight text-[#0b4a92] min-[400px]:text-[1.6rem] min-[500px]:text-[1.8rem]">
                        ${currentSubtotal.toLocaleString("es-MX")}
                      </span>
                      <span className="pb-0.5 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400 min-[400px]:text-xs">
                        MXN
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {purchaseType === "pieza"
                        ? `${piecePrice.toLocaleString("es-MX")} por pieza`
                        : selectedWholesalePieces
                          ? `${wholesaleUnitTotal.toLocaleString("es-MX")} por caja`
                          : `${priceBase.toLocaleString("es-MX")} base por volumen`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 min-[400px]:mt-4 min-[400px]:space-y-2.5">
              <button
                onClick={handleAddToCart}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#FFE34B_0%,#FFD400_55%,#F7C900_100%)] px-4 py-3 text-center text-sm font-extrabold text-[#202531] shadow-[0_18px_30px_rgba(255,205,0,0.30)] transition-all duration-200 hover:brightness-[1.02] active:scale-[0.99] min-[400px]:min-h-[54px] min-[400px]:gap-2.5 min-[400px]:rounded-[22px] min-[400px]:text-base"
              >
                <ShoppingCart
                  size={18}
                  className="min-[400px]:h-5 min-[400px]:w-5"
                />
                Agregar al carrito
                <ArrowRight
                  size={16}
                  className="min-[400px]:h-[18px] min-[400px]:w-[18px]"
                />
              </button>

              <a
                href={`https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20Conc.%20${selectedConcentration}%20-%20${encodeURIComponent(selected?.label ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs font-semibold text-slate-500 transition hover:text-[#003F91] min-[400px]:text-sm"
                title="Cotizar por WhatsApp"
              >
                <MessageCircle size={15} />
                Compra directa
                <ArrowRight size={14} />
              </a>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});

export default ProductCard;
