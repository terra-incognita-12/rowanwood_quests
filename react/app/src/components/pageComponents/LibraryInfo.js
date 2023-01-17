import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

// import { useMediaQuery } from "@material-ui/core";
// import useMediaQuery from "@material-ui/core/useMediaQuery";
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import axios from "../../api/axios"

const LibraryInfo = ({ url }) => {

	const [record, setRecord] = useState("")

    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
    // const isSmallScreen = /xs|sm/.test(width)

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
                    <Box display="flex" justifyContent="center" alignItems="center" className="mb-3">
                        <Box
                            component="img"
                            sx={{
                                height: 600,
                                width: 600,
                                maxHeight: { xs: 400, md: 600 },
                                maxWidth: { xs: 400, md: 600 },
                                borderRadius: '16px',
                            }}
                            alt="Photo"
                            src={record.photo}
                        />
                    </Box>
                    
                    <Typography 
                        gutterBottom 
                        variant="body1"
                        sx={isSmallScreen
                            ? { p: 3 }
                            : { p: 1 }
                        }
                    >
                        {record.description}
                    </Typography>
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