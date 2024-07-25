import React, { useEffect, useState } from 'react';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(response => response.json())
      .then(data => setProducts(data));
  }, []);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => observer.observe(card));

    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, [products]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const productId = product.id;
      let updatedCart;
      if (prevCart[productId]) {
        updatedCart = {
          ...prevCart,
          [productId]: {
            ...prevCart[productId],
            quantity: prevCart[productId].quantity + 1,
          }
        };
      } else {
        updatedCart = {
          ...prevCart,
          [productId]: {
            ...product,
            quantity: 1,
          }
        };
      }
      setNotification({ message: `🛒 Added ${product.title} to the cart`, type: 'success' });
      return updatedCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      if (!prevCart[productId]) {
        setNotification({ message: 'Product not found in the cart', type: 'error' });
        return prevCart;
      }
      const newCart = { ...prevCart };
      const removedProduct = newCart[productId];
      delete newCart[productId];
      if (removedProduct) {
        setNotification({ message: `🗑️ Removed ${removedProduct.title} from the cart`, type: 'error' });
      }
      return newCart;
    });
  };

  const decreaseQuantity = (productId) => {
    setCart(prevCart => {
      const currentProduct = prevCart[productId];
      if (!currentProduct) return prevCart;

      if (currentProduct.quantity > 1) {
        return {
          ...prevCart,
          [productId]: {
            ...currentProduct,
            quantity: currentProduct.quantity - 1,
          }
        };
      } else {
        return removeFromCart(productId);
      }
    });
  };

  const calculateTotal = () => {
    if (!cart || typeof cart !== 'object') return '0.00';
    return Object.values(cart)
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      setNotification({ message: 'Your cart is empty!', type: 'error' });
    } else {
      setNotification({ message: 'Processing your order...', type: 'info' });
      setTimeout(() => {
        setNotification({ message: '🛍️ Order successfully processed!', type: 'success' });
        setCart({});
      }, 2000);
    }
  };

  return (
    <div className="container">
      <div className={`notification ${notification.type} ${notification.message ? 'show' : ''}`}>
        {notification.message}
      </div>
      {/* Cabecera con Íconos de Navegación */}
      <div className="header">
        <h1>E-Commerce</h1>
        <div>
          <a href="#product-list" className="nav-icon">🛍️</a>
          <a href="#cart" className="nav-icon">🛒</a>
        </div>
 
      </div>
      <div id="product-list" className="product-list">
        <h2>🛍️ Available Products</h2>
        <div className="products">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.title} className="product-image" />
              <h3 className="product-title">{product.title}</h3>
              <p className="product-price">${product.price}</p>
              <button onClick={() => addToCart(product)}>Add to Cart 🛒</button>
            </div>
          ))}
        </div>
      </div>
      <div id="cart" className="cart">
        <h2>🛒 Shopping Cart</h2>
        {Object.values(cart).map(product => (
          <div key={product.id} className="cart-item">
            <p>{product.title} - ${product.price} x {product.quantity}</p>
            <div className="cart-actions">
              {product.quantity > 1 && (
                <button onClick={() => decreaseQuantity(product.id)}>-</button>
              )}
              <button onClick={() => addToCart(product)}>+</button>
              <button onClick={() => removeFromCart(product.id)}>🗑️ Remove</button>
            </div>
          </div>
        ))}
        <h3 className="cart-total">Total: ${calculateTotal()}</h3>
        <button onClick={handleCheckout} className="checkout-button">Checkout 🛍️</button>
      </div>
    </div>
  );
}

export default ProductList;
