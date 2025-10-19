import React from 'react';
import PropTypes from 'prop-types';

function ProductList({ products, onEdit, onDelete, onAddToCart, currentUserId }) {
    // A separate component for a single product item improves readability and reusability.
    const ProductItem = ({ product }) => (
        <li className="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <b>{product.name}</b> - ${product.price} <br />
                <small className="text-muted">{product.description}</small><br />
                {product.seller && <small><i>Seller: {product.seller.username}</i></small>}
            </div>
            <div>
                {product.seller && currentUserId === product.seller._id ? (
                    <>
                        <button onClick={() => onEdit(product)} className="btn btn-sm btn-outline-primary me-2">Edit</button>
                        <button onClick={() => onDelete(product._id)} className="btn btn-sm btn-outline-danger">Delete</button>
                    </>
                ) : (
                    <button onClick={() => onAddToCart(product._id)} className="btn btn-sm btn-success">Add to Cart</button>
                )}
            </div>
        </li>
    );

    return (
        <div>
            <h3>All Products</h3>
            <ul className="list-group">
                {products.length === 0 ? (
                    <li className="list-group-item">No products have been added yet.</li>
                ) : (
                    products.map((product) => (
                        <ProductItem key={product._id} product={product} />
                    ))
                )}
            </ul>
        </div>
    );
}

// Adding PropTypes helps catch bugs by ensuring components receive the right type of props.
ProductList.propTypes = {
    products: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired,
    currentUserId: PropTypes.string
};

export default ProductList;