import React, { useEffect, useState } from 'react';
import './ProductList.css';

function ProductList() {
  // Estados para almacenar productos, carrito y notificaciones
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });

  // useEffect para obtener los productos desde la API al cargar el componente
  useEffect(() => {
    fetch('https://fakestoreapi.com/products') // Petición a la API de productos
      .then(response => response.json()) // Parsear la respuesta en formato JSON
      .then(data => setProducts(data)); // Almacenar los productos en el estado
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montarse el componente

  // useEffect para manejar las notificaciones, desaparecen después de 3 segundos
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' }); // Limpiar la notificación después de 3 segundos
      }, 3000);
      return () => clearTimeout(timer); // Limpiar el timeout al desmontar el componente o cambiar la notificación
    }
  }, [notification]); // Se ejecuta cada vez que cambia el estado de 'notification'

  // useEffect para manejar la intersección de las tarjetas de productos, añadiendo la clase 'visible'
  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // Añadir clase cuando el elemento es visible
          observer.unobserve(entry.target); // Dejar de observar el elemento
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.product-card'); // Seleccionar todas las tarjetas de productos
    cards.forEach(card => observer.observe(card)); // Observar cada tarjeta

    return () => {
      cards.forEach(card => observer.unobserve(card)); // Limpiar observadores al desmontar el componente
    };
  }, [products]); // Se ejecuta cada vez que cambia el estado de 'products'

  // Función para añadir un producto al carrito
  const addToCart = (product) => {
    setCart(prevCart => {
      const productId = product.id;
      let updatedCart;
      if (prevCart[productId]) {
        updatedCart = {
          ...prevCart,
          [productId]: {
            ...prevCart[productId],
            quantity: prevCart[productId].quantity + 1, // Incrementar la cantidad si ya existe en el carrito
          }
        };
      } else {
        updatedCart = {
          ...prevCart,
          [productId]: {
            ...product,
            quantity: 1, // Añadir el producto con cantidad inicial de 1 si no está en el carrito
          }
        };
      }
      setNotification({ message: `🛒 Added ${product.title} to the cart`, type: 'success' }); // Mostrar notificación
      return updatedCart;
    });
  };

  // Función para eliminar un producto del carrito
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

  // Función para disminuir la cantidad de un producto en el carrito
  const decreaseQuantity = (productId) => {
    setCart(prevCart => {
      const currentProduct = prevCart[productId];
      if (!currentProduct) return prevCart;

      if (currentProduct.quantity > 1) {
        return {
          ...prevCart,
          [productId]: {
            ...currentProduct,
            quantity: currentProduct.quantity - 1, // Disminuir la cantidad en uno
          }
        };
      } else {
        return removeFromCart(productId); // Eliminar del carrito si la cantidad llega a 0
      }
    });
  };

  // Función para calcular el total del carrito
  const calculateTotal = () => {
    if (!cart || typeof cart !== 'object') return '0.00';
    return Object.values(cart)
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2); // Calcular el total sumando el precio por la cantidad de cada producto
  };

  // Función para procesar el pedido
  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      setNotification({ message: 'Your cart is empty!', type: 'error' }); // Mostrar error si el carrito está vacío
    } else {
      setNotification({ message: 'Processing your order...', type: 'info' });
      setTimeout(() => {
        setNotification({ message: '🛍️ Order successfully processed!', type: 'success' });
        setCart({}); // Vaciar el carrito después de procesar el pedido
      }, 2000);
    }
  };

  return (
    <div className="container">
      {/* Notificación */}
      <div className={`notification ${notification.type} ${notification.message ? 'show' : ''}`}>
        {notification.message}
      </div>
      {/* Lista de productos */}
      <div className="product-list">
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
      {/* Carrito de compras */}
      <div className="cart">
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
