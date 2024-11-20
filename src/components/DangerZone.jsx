import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { Modal, Button, notification } from 'antd'; // Assuming you're using Ant Design
import { useNavigate } from 'react-router-dom'; // Import React Router's navigate hook
import { deleteLocation } from 'app/deleteSlice/deleteSlice';
import { toast } from 'react-toastify';

const LocationDeleteModal = ({ id }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize the navigate hook
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentRef = useRef(false);

    const deleting = useSelector(state => state.deleteLocation.deleting);
    const error = useSelector(state => state.deleteLocation.error);
    const success = useSelector(state => state.deleteLocation.success);

    // Show modal when user initiates delete action
    const showModal = () => {
        setIsModalOpen(true);
    };

    // Handle delete confirmation
    const handleOk = () => {
        dispatch(deleteLocation(id)); // Dispatch the delete action
    };

    // Handle modal close
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // Effect to close the modal and redirect when delete is successful
    useEffect(() => {
        if (success) {
            setIsModalOpen(false); // Close modal on success
            navigate('/locations'); // Redirect to locations route
            toast.success("Location was deleted successfully")
        }
    }, [success, navigate]); // Add `navigate` to the dependency array

    // Effect to show toast notification for errors
    useEffect(() => {
        if (error && currentRef.current == false) {
            toast.error(error)
            currentRef.current = true;
        }
    }, [error]);

    return (
        <>
            <div className="container">
            <h2><strong>Are you sure you want to delete this location?</strong></h2>
            <p>This action is irreversible, and once deleted, you won't be able to recover this location's data.</p>
                <Button onClick={showModal} danger>
                    Delete Location
                </Button>
            </div>
            
            <Modal
                title="Confirm Delete"
                visible={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={deleting}
                okText="Yes"
            >
                <p>Are you sure you want to delete this location?</p>
            </Modal>

        </>
    );
};

export default LocationDeleteModal;
