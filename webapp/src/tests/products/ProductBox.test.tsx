import { fireEvent, render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import ProductBox from "../../components/shop/products/ProductBox";
import { CartItem, Product } from "../../shared/shareddtypes";

test("A product is rendered", async () => {
  const product: Product = {
    code: "9999",
    name: "Producto Prueba 1",
    description: "Descripcion Prueba 1",
    price: 10,
    stock: 20,
    image: "9999.png",
    category: "Electronics",
    weight: 1,
  };

  const { getByText, container } = render(
    <Router>
      <ProductBox product={product} currentCartAmount={0} onAdd={() => {}} />
    </Router>
  );

  expect(getByText(product.name)).toBeInTheDocument();
  expect(getByText(product.price + "€")).toBeInTheDocument();
  expect(getByText(product.description)).toBeInTheDocument();

  //Check that the default image is rendered
  const image = container.querySelector("img") as HTMLImageElement;
  expect(image.src).toContain("http://localhost:5000/9999.png");

  //Check that the info about stock is rendered correctly
  expect(getByText("Stock available!")).toBeInTheDocument();
});

test("A product is added to the cart", async () => {
  const product: Product = {
    code: "9999",
    name: "Producto Prueba 1",
    description: "Descripcion Prueba 1",
    price: 10,
    stock: 20,
    image: "",
    category: "Electronics",
    weight: 1,
  };
  const cart: CartItem[] = [];

  const { getByText } = render(
    <Router>
      <ProductBox
        product={product}
        currentCartAmount={0}
        onAdd={() => {
          cart.push({ product: product, amount: 1 });
        }}
      />
    </Router>
  );

  const addButton = getByText("Add product");
  fireEvent.click(addButton);
  expect(cart.length).toEqual(1);
});

test("URL to product details works", async () => {
  const product: Product = {
    code: "9999",
    name: "Producto Prueba 1",
    description: "Descripcion Prueba 1",
    price: 10,
    stock: 20,
    image: "",
    category: "Electronics",
    weight: 1,
  };
  const cart: CartItem[] = [];

  const { container } = render(
    <Router>
      <ProductBox product={product} currentCartAmount={0} onAdd={() => {}} />
    </Router>
  );

  const hrefDetails = container.querySelector("img") as HTMLElement;

  fireEvent.click(hrefDetails);
  expect(window.location.pathname).toEqual("/product/" + product.code);
});
