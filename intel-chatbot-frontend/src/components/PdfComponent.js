import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { SERVER_URL } from '../App';
import { getUserToken } from '../localStorage';

const PdfUploadComponent = () => {
  const [pdfs, setPdfs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userToken, setUserToken] = useState(getUserToken());
  const [unsavedPdf, setUnsavedPdf] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newPdf = {
        id: uuidv4(),
        file,
        title: file.name,
        url: URL.createObjectURL(file),
        saved: false,
      };
      setPdfs((prevPdfs) => [...prevPdfs, newPdf]);
      setUnsavedPdf(true);
    }
  };

  const handleRemovePdf = (pdf) => {
    if (pdf.saved) {
      // Remove from server
      fetch(`${SERVER_URL}/chat/delete_pdf/${pdf.title}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${userToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete PDF");
          }
          return response.json();
        })
        .then(() => {
          setPdfs((prevPdfs) => prevPdfs.filter((p) => p.id !== pdf.id));
        })
        .catch((error) => {
          alert(error.message);
        });
    } else {
      setPdfs((prevPdfs) => prevPdfs.filter((p) => p.id !== pdf.id));
      setUnsavedPdf(false);
    }
  };

  const viewPDFs = useCallback(() => {
    fetch(`${SERVER_URL}/chat/view_pdfs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fetching PDFs failed");
        }
        return response.json();
      })
      .then((data) => {
        const saved = data.pdfs.map((pdf) => ({
          id: uuidv4(),
          title: pdf.title,
          url: `${SERVER_URL}/chat/view_pdf/${pdf.title}?token=${userToken}`,
          saved: true,
        }));
        setPdfs(saved);
      })
      .catch((error) => {
        alert(error.message);
      });
  }, [userToken]);

  useEffect(() => {
    if (userToken) {
      viewPDFs();
    }
  }, [viewPDFs, userToken]);

  const handleUpload = async () => {
    const formData = new FormData();
    pdfs.forEach((pdf) => {
      if (!pdf.saved) {
        formData.append('file', pdf.file);
      }
    });

    fetch(`${SERVER_URL}/chat/upload_pdf`, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${userToken}`,
      },
      body: formData,
    })
      .then((response) => {
        if (response.status === 400) {
          throw new Error("Files must be of PDF format");
        } else if (!response.ok) {
          throw new Error("Uploading PDFs failed");
        }
        return response.json();
      })
      .then(() => {
        setPdfs((prevPdfs) =>
          prevPdfs.map((pdf) => ({ ...pdf, saved: true }))
        );
        setAnchorEl(null); 
        setUnsavedPdf(false); 
        viewPDFs(); 
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box p={2}>
      <input
        type="file"
        id="pdf-upload"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="application/pdf"
        disabled={unsavedPdf}
      />
      <IconButton color='inherit' component="span" onClick={handleMenuOpen}>
        <AttachFileIcon style={{ cursor: 'pointer' }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <label htmlFor="pdf-upload">
            <Typography variant="button">Upload PDF</Typography>
          </label>
        </MenuItem>
        <List>
          {pdfs.map((pdf) => (
            <ListItem key={pdf.id} style={{ color: pdf.saved ? 'black' : 'blue' }}>
              <ListItemText primary={pdf.title} style={{marginRight: 20}} />
              <ListItemSecondaryAction style={{flexGrow:1}}> 
                <IconButton
                  edge="end"
                  component="a"
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton edge="end" style={{marginLeft: 4}} onClick={() => handleRemovePdf(pdf)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {unsavedPdf && (
          <MenuItem>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
            >
              Save
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PdfUploadComponent;
