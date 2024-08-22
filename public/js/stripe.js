import { showAlert } from "./alerts";
const stripe=Stripe('pk_test_51Pe7kpRxdmX4TkLvnNStsqKMI0UjKhPalcYyXTzcfhgU8jdDnDS2RfLGzlfR7k6lTc0jjFTgP58cAszI0ilYfcEP00w0Bs2tOZ')
export const bookTour= async(tourId)=>{
    try {
        const res=await fetch(`/api/v1/bookings/checkout-session/${tourId}`,{
            method:'GET',
            'Content-type':'applicat/json'
        })
        const session=await res.json();
        await stripe.redirectToCheckout({
            sessionId:session.session.id
        });
        
    } catch (error) {
        showAlert('error',error)
    }
}
