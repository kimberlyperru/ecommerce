import React from 'react';

function ProductForm({ form, editingProduct, onFormChange, onSubmit, onCancelEdit }) {
    return (
        <div className="card mb-4">
            <div className="card-body">
                <h3 className="card-title">{editingProduct ? "Edit Product" : "Add a New Product"}</h3>
                <div className="mb-2">
                    <input name="name" placeholder="Product Name" className="form-control" value={form.name || ''} onChange={onFormChange} />
                </div>
                <div className="mb-2">
                    <input name="price" placeholder="Price" className="form-control" value={form.price || ''} onChange={onFormChange} />
                </div>
                <div className="mb-3">
                    <input name="description" placeholder="Description" className="form-control" value={form.description || ''} onChange={onFormChange} />
                </div>
                <button onClick={onSubmit} className="btn btn-primary">
                    {editingProduct ? "Update Product" : "Add Product"}
                </button>
                {editingProduct && (
                    <button onClick={onCancelEdit} className="btn btn-secondary ms-2">
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProductForm;