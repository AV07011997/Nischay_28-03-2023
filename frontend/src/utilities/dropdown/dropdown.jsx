import React, { useState } from "react";
import { ButtonToolbar, Dropdown } from "rsuite";

const DropDown = (prop) => {
  var [items, setItems] = useState(prop.items);

  return (
    <ButtonToolbar>
      <Dropdown title="Dropdown" activeKey={selectedItem}>
        {items?.map((item) => {
          return <Dropdown.Item eventKey={item}> {item}</Dropdown.Item>;
        })}
      </Dropdown>
    </ButtonToolbar>
  );
};

export default DropDown;
