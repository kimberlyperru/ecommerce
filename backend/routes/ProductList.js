import React from 'react';
import { jwtDecode } from 'jwt-decode';

function ProductList({ products, onEdit, onDelete, onAddToCart }) {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const currentUserId = decodedToken ? decodedToken.userId : null;

    return (
        <div>
            <h3>All Products</h3>
            <ul className="list-group">
                {products.map((p) => (
                    <li key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <b>{p.name}</b> - ${p.price} <br />
                            <small className="text-muted">{p.description}</small><br />
                            {p.seller && <small><i>Seller: {p.seller.username}</i></small>}
                        </div>
                        <div>
                            {p.seller && currentUserId === p.seller._id ? (
                                <><button onClick={() => onEdit(p)} className="btn btn-sm btn-outline-primary me-2">Edit</button>
                                <button onClick={() => onDelete(p._id)} className="btn btn-sm btn-outline-danger">Delete</button></>
                            ) : (<button onClick={() => onAddToCart(p._id)} className="btn btn-sm btn-success">Add to Cart</button>)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductList;