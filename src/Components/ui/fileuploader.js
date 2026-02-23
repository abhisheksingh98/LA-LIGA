import React, { Component } from 'react';
import { firebaseStorage, ref, uploadBytes, getDownloadURL } from '../../firebase';
import CircularProgress from '@material-ui/core/CircularProgress'

class Fileuploader extends Component {

    state = {
        name: '',
        isUploading: false,
        fileURL: ''
    }

    handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        this.setState({ isUploading: true });

        try {
            const filename = `${Date.now()}_${file.name}`;
            const storageRef = ref(firebaseStorage, `${this.props.dir}/${filename}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get download URL
            const url = await getDownloadURL(storageRef);

            this.setState({
                name: filename,
                isUploading: false,
                fileURL: url
            });

            this.props.filename(filename);
        } catch (error) {
            console.error('Upload error:', error);
            this.setState({ isUploading: false });
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.defaultImg) {
            return state = {
                name: props.defaultImgName,
                fileURL: props.defaultImg
            }
        }
        return null
    }


    uploadAgain = () => {
        this.setState({
            name: '',
            isUploading: false,
            fileURL: ''
        });
        this.props.resetImage();
    }

    render() {
        return (
            <div>
                {!this.state.fileURL ?
                    <div>
                        <div className="label_inputs">{this.props.tag}</div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={this.handleFileUpload}
                            disabled={this.state.isUploading}
                            style={{ display: 'block', margin: '10px 0' }}
                        />
                    </div>
                    : null
                }
                {this.state.isUploading ?
                    <div className="progress"
                        style={{ textAlign: 'center', margin: '30px 0' }}
                    >
                        <CircularProgress
                            style={{ color: '#98c6e9' }}
                            thickness={7}
                        />
                    </div>
                    : null
                }
                {this.state.fileURL ?
                    <div className="image_upload_container">
                        <img
                            style={{
                                width: '100%'
                            }}
                            src={this.state.fileURL}
                            alt={this.state.name}
                        />
                        <div className="remove" onClick={() => this.uploadAgain()}>
                            Remove
                        </div>
                    </div>

                    : null
                }
            </div>
        );
    }
}

export default Fileuploader;