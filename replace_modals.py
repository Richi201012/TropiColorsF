import re
import sys

try:
    with open(r'c:\laragon\www\Tropic-Colors\artifacts\tropicolors\src\pages\Admin.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    add_modal = """      {/* Add Product Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                  <Package size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-950">
                    Agregar Nuevo Producto
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Completa la información para catalogar el producto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar">
              <div className="space-y-6">
                {/* General Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Información General
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        placeholder="Ej: Rojo Fresa"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Categoría
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Color (Hex)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="color"
                            value={newProduct.hex}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, hex: e.target.value })
                            }
                            className="absolute -inset-4 h-20 w-20 cursor-pointer appearance-none bg-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          value={newProduct.hex}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, hex: e.target.value })
                          }
                          placeholder="#000000"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium uppercase outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Notas (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newProduct.note}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, note: e.target.value })
                        }
                        placeholder="Detalles adicionales..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Industrial Toggle */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200 hover:bg-slate-100/50">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">Uso Industrial</p>
                      <p className="text-xs text-slate-500">Marcar si este producto es de grado industrial.</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 [&:has(:checked)]:bg-emerald-600">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={newProduct.industrial}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            industrial: e.target.checked,
                          })
                        }
                      />
                      <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform peer-checked:translate-x-6" />
                    </div>
                  </label>
                </div>

                {/* Pricing 125g */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Precios • Presentación 125g
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {PRESENTATION_LABELS.map((label, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <label className="mb-2 block text-xs font-bold text-slate-500 truncate">
                          {label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={newProduct.prices125[idx]}
                            onChange={(e) => {
                              const newPrices = [...newProduct.prices125] as [
                                number, number, number, number, number
                              ];
                              newPrices[idx] = parseFloat(e.target.value) || 0;
                              setNewProduct({
                                ...newProduct,
                                prices125: newPrices,
                              });
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-6 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing 250g */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Precios • Presentación 250g
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {PRESENTATION_LABELS.map((label, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <label className="mb-2 block text-xs font-bold text-slate-500 truncate">
                          {label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={newProduct.prices250[idx]}
                            onChange={(e) => {
                              const newPrices = [...newProduct.prices250] as [
                                number, number, number, number, number
                              ];
                              newPrices[idx] = parseFloat(e.target.value) || 0;
                              setNewProduct({
                                ...newProduct,
                                prices250: newPrices,
                              });
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-6 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNewProduct}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Guardando..." : "Crear Producto"}
              </button>
            </div>
          </div>
        </div>, document.body
      )}"""

    edit_modal = """      {/* Edit Product Modal */}
      {showEditModal && editingProduct && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-primary shadow-inner">
                  <Package size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-950">
                    Editar Producto
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Actualiza la información y precios de este artículo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar">
              <div className="space-y-6">
                {/* General Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Información General
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Categoría
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Color (Hex)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="color"
                            value={editingProduct.hex}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                hex: e.target.value,
                              })
                            }
                            className="absolute -inset-4 h-20 w-20 cursor-pointer appearance-none bg-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          value={editingProduct.hex}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              hex: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium uppercase outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Notas (Opcional)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.note}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            note: e.target.value,
                          })
                        }
                        placeholder="Detalles adicionales..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Industrial Toggle */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200 hover:bg-slate-100/50">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">Uso Industrial</p>
                      <p className="text-xs text-slate-500">Marcar si este producto es de grado industrial.</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 [&:has(:checked)]:bg-primary">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={editingProduct.industrial}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            industrial: e.target.checked,
                          })
                        }
                      />
                      <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform peer-checked:translate-x-6" />
                    </div>
                  </label>
                </div>

                {/* Pricing 125g */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Precios • Presentación 125g
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {PRESENTATION_LABELS.map((label, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <label className="mb-2 block text-xs font-bold text-slate-500 truncate">
                          {label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={editingProduct.prices125[idx]}
                            onChange={(e) => {
                              const newPrices = [...editingProduct.prices125] as [
                                number, number, number, number, number
                              ];
                              newPrices[idx] = parseFloat(e.target.value) || 0;
                              setEditingProduct({
                                ...editingProduct,
                                prices125: newPrices,
                              });
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-6 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing 250g */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Precios • Presentación 250g
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {PRESENTATION_LABELS.map((label, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <label className="mb-2 block text-xs font-bold text-slate-500 truncate">
                          {label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={editingProduct.prices250[idx]}
                            onChange={(e) => {
                              const newPrices = [...editingProduct.prices250] as [
                                number, number, number, number, number
                              ];
                              newPrices[idx] = parseFloat(e.target.value) || 0;
                              setEditingProduct({
                                ...editingProduct,
                                prices250: newPrices,
                              });
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-6 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-5 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/20 transition hover:bg-blue-700 hover:shadow-primary/30 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>, document.body
      )}"""

    add_modal_regex = re.compile(r'      \{\/\* Add Product Modal \*\/\}.*?(?=      \{\/\* Edit Product Modal \*\/\})', re.DOTALL)
    edit_modal_regex = re.compile(r'      \{\/\* Edit Product Modal \*\/\}.*?(?=      \{\/\* Delete Confirmation Modal \*\/\})', re.DOTALL)

    new_content = add_modal_regex.sub(add_modal + '\n\n', content)
    new_content = edit_modal_regex.sub(edit_modal + '\n\n', new_content)

    if new_content == content:
        print("Error: No replacements were made.")
        sys.exit(1)

    with open(r'c:\laragon\www\Tropic-Colors\artifacts\tropicolors\src\pages\Admin.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Success: Modals replaced.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
