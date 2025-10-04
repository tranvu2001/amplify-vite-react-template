import { Tabs } from "@aws-amplify/ui-react";
import TabNhaDatBan from "./TabNhaDatBan";
import '../Tabs/searchTab.css'
import TabNhaDatChoThue from "./TabNhaDatChoThue";
import TabDuAn from "./TabDuAn";

function SearchTab() {
    return (
        <>
            <div className="search-tab">
                <Tabs width={"50%"}
                    className="tabs"
                    
                    defaultValue="Nhà đất bán"
                    // justifyContent={"center"}
                    items={[
                        {
                            label: "Nhà đất bán", value: "Nhà đất bán", content: (<>
                                <TabNhaDatBan />
                            </>)
                        },
                        { label: "Nhà đất cho thuê", value: "Nhà đất cho thuê", content: (<>
                            <TabNhaDatChoThue />
                        </>) },
                        { label: "Dự án", value: "Dự án",  content: (<>
                            <TabDuAn />
                        </>)}
                    ]}
                />
            </div>
        </>
    )
}

export default SearchTab;