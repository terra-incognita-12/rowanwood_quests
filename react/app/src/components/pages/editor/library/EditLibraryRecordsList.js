import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Link } from "react-router-dom"

const EditLibraryRecordsList = () => {
	return (
		<div className="mt-3">
			<Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>

			<Row className="justify-content-center mt-3">
                <Col xs={12} md={8}>
                    <Card>
						<CardActions>
			        		<Button size="small">Learn More</Button>
			      		</CardActions>
					</Card>   
                </Col>
            </Row>
		</div>
	)
}

export default EditLibraryRecordsList