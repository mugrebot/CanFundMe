import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useScaffoldEventHistory, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

const MARQUEE_PERIOD_IN_SEC = 5;

    export const EventAnimation = ({ contractAddress }) => {
  // ... (other states and refs)
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);

  // Get recent events
  //events
  useScaffoldEventSubscriber({
    contractName: "CanFundMe",
    eventName: "Funded",
    address: contractAddress,
    listener: (contributor, amount) => {
      console.log("CANTOOOOOO", contributor, Number(amount));
      setEventHistory((prevEvents) => [
        ...prevEvents,
        {
          type: "Funded",
          contributor,
          amount: Number(amount),
          transactionHash: event?.transactionHash,
        },
      ]);
    },
  });

useScaffoldEventSubscriber({
    contractName: "CanFundMe",
    eventName: "NoteFunded",
    address: contractAddress,
    listener: (contributor, amount) => {
      console.log("NOOOOOOTEEE", contributor, Number(amount));
      setEventHistory((prevEvents) => [
        ...prevEvents,
        {
          type: "NoteFunded",
          contributor,
          amount: Number(amount)/10^18,
          transactionHash: event?.transactionHash,
        },
      ]);
    },
  });


  // ... (other effects and functions)
    useEffect(() => {
    if (eventHistory.length > 0) {
        setIsRightDirection((prev) => !prev);
    }
    }, [eventHistory]);

    
    
 

    return (
        <div className="flex flex-col justify-center items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
          {/* ... (other elements) */}
          <div>
            <div className="relative overflow-x-hidden">
              {new Array(3).fill("").map((_, i) => {
                const isLineRightDirection = i % 2 ? isRightDirection : !isRightDirection;
                return (
                  <Marquee
                    key={i}
                    direction={isLineRightDirection ? "right" : "left"}
                    gradient={false}
                    play={true}
                    speed={5}
                  >
                    <div className="px-4">
                      {eventHistory.length > 0
                        ? eventHistory
                            .filter((_, index) => index % 3 === i)
                            .map((event) => (
                              <span key={event.transactionHash}>
                                {event.type}: Contributor:{event.contributor}
                                <br />
                             Amount:{(event.amount)} Wei
                              </span>
                            ))
                        : " "}
                    </div>
                  </Marquee>
                );
              })}
            </div>
          </div>
          {/* ... (other elements) */}
        </div>
      );
};

export default EventAnimation;
