import { Outlet } from "react-router-dom";
import Header from "../Components/Header/Header.jsx";
import Banner from "../Components/Banner/Banner";
import ProductCard from "../Components/Card/ProductCard.jsx";



function Home() {
    return (
        <>
        
        <Header />
        <Banner />
        <ProductCard />
        <Outlet />
        </>
    )
}

export default Home;