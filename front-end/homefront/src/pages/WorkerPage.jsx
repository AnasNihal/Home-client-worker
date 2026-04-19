import WorkersSection from "../components/WorkerSection"
import SponsorsSection from "../components/Sponsor"
import TopSection from "../components/TopSection"
import BookingSection from "../components/SimpleBookingSection"

export default function WorkerPage(){
    return(
        <>  
            <TopSection
            title="Our expertise"
            subtitle="Cleaning Service Company"
            bgColor="bg-[#1c392e]" // optional background override
            />
            <WorkersSection/>
            <BookingSection/>
            <SponsorsSection type="services"/>
        </>
    )
}