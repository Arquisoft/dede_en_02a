import React, { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';

import { Product } from '../shared/shareddtypes';
import ProductBox from './ProductBox';
import { getProducts } from '../api/api';

type ProductListProps = {
    products: Product[];
    OnAddCart: (product : Product) => void;
}

function ProductList(props: ProductListProps) : JSX.Element{
    // let product: Product = {code:"1234", name: "Camiseta Real Madrid Vinisius", description:"Camistea Real Madrid XL Temporada 21/22", price: 75.5, stock: 100};
    // let product1 : Product = {code:"1236", name: "Camiseta Real Madrid Mbappe", description:"Camistea Real Madrid XL Temporada 22/23 Bastante Fake La verdad", price: 250, stock: 50};
    // let product2 : Product={code: "1237", name: "Camiseta Real Madrid El Bichooo", description:"SUUUUUUUUUUUUUU", price: 1500, stock: 0};
    // let product3 : Product={code:"1347", name:"Camiseta Real Sporting Jony", description: "Ni de coña chaval", price:10.99, stock: 10};
    // const [products] = useState([product, product1, product2, product3]);
    
    const[products, setProducts] = useState<Product[]>([]);
    
    const refreshProductList = async () =>{
        setProducts(await getProducts());
    }

    //Works like componentDidMount(), it is called when the component is render for the first time.
    useEffect(() =>{
        refreshProductList();
    },
    []);

    return (
        <Grid 
            container
            columns={50}
            rowSpacing={5}
            className="mt-2 mb-2"
        >
            {
                products.map(product => (
                    <Grid item xs={25}>
                        <ProductBox 
                            product={product}
                            onAdd={(productToAdd : Product) => props.OnAddCart(productToAdd)}
                        />
                    </Grid>
                ))
            }
        </Grid>
    )
}

export default ProductList;