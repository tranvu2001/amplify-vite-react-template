import { Button } from "@aws-amplify/ui-react"
import '@aws-amplify/ui-react/styles.css';
const ButtonAction = () => {
    return(
        <Button onClick={() => alert("Hello")}>Click me!</Button>
    )
}

export default ButtonAction