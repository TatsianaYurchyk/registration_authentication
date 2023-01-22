import { Container} from "react-bootstrap";
import UsersPageLoggedInView1 from "../components/UsersPageLoggedInView";
import UsersPageLoggedOutView from "../components/UsersPageLoggedOutView";
import { User } from "../models/user";

interface UsersPageProps {
    loggedInUser: User | null,
}

const UsersPage = ({ loggedInUser }: UsersPageProps) => {
    return (
        <Container >
            <>
                {loggedInUser
                    ? <UsersPageLoggedInView1 loggedInUser={loggedInUser}/>
                    : <UsersPageLoggedOutView />
                }
            </>
        </Container>
    );
}

export default UsersPage;