import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"

const Editor = () => {
	return (
		<>	
			<Row className="mt-5">
				<Col xs={12} md={3}>
					<Card>
	                    <Card.Body className="text-center">
	                        <Link to='/editor/quest/create' className="btn btn-success w-100">Create Quest</Link>
	                    </Card.Body>
	                </Card>
				</Col>
				<Col xs={12} md={3}>
					<Card>
	                    <Card.Body className="text-center">
	                        <Link to='/editor/quest/edit' className="btn btn-success w-100">Edit Quest</Link>
	                    </Card.Body>
	                </Card>
				</Col>
				<Col xs={12} md={3}>
					<Card>
	                    <Card.Body className="text-center">
	                        <Link to="/editor/library/create" className="btn btn-success w-100">Create Library Record</Link>
	                    </Card.Body>
	                </Card>
				</Col>
				<Col xs={12} md={3}>
					<Card>
	                    <Card.Body className="text-center">
	                        <Link to='/editor' className="btn btn-success w-100">Edit Library Record</Link>
	                    </Card.Body>
	                </Card>
				</Col>
			</Row>
		</>
	)
}

export default Editor