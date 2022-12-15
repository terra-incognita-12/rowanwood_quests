import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import axios from "../../api/axios"

const LibraryInfo = ({ url }) => {

	const [record, setRecord] = useState("")

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getRecord = async () => {
            
            try {
                const response = await axios.get(`/library/records/${url}`, {
                    signal: controller.signal
                })
                response.data.name = response.data.name.toUpperCase()
                isMounted && setRecord(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        getRecord()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

	return (
        <div className="mt-3">
            <Button component={Link} to="/library" variant="text" size="large">&lt;&lt; Back</Button>
            <Card className="mt-3">
                <CardContent>
                    <Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">{record.name}</Typography>
                    <Typography gutterBottom variant="body1">{record.description}</Typography>
                    {record.library_tags?.length
                        ?
                        record.library_tags.map((tag, i) =>             
                            <Button component={Link} to={`/library?tag=${tag.name}`} key={i} variant="text">#{tag.name} </Button>
                        )
                        : null
                    }
                </CardContent>
            </Card>
        </div>
	)

}

export default LibraryInfo