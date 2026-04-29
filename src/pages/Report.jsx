// pages/Report.jsx
import { useState } from 'react';



const Report = () => {
  const [formData, setFormData] = useState({ location: '', description: '', file: null });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      setFormData({ location: '', description: '', file: null });
      
      // Reset file input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <section className="report-section">
      <div className="container">
        <h1><i className="fas fa-exclamation-circle"></i> Report an Alert</h1>
        
        {submitted && (
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto 24px', 
            background: 'rgba(16, 185, 129, 0.2)', 
            padding: '16px', 
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #10b981'
          }}>
            ✅ Alert submitted successfully! Thank you for helping your community.
          </div>
        )}
        
        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              id="location" 
              placeholder=" " 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required 
            />
            <label htmlFor="location">
              <i className="fas fa-map-marker-alt"></i> Location
            </label>
          </div>
          
          <div className="form-group">
            <textarea 
              id="description" 
              placeholder=" "
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
            <label htmlFor="description">
              <i className="fas fa-info-circle"></i> Description
            </label>
          </div>
          
          <div className="form-group">
            <input 
              type="file" 
              id="image" 
              accept="image/*" 
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
            />
            <label htmlFor="image">
              <i className="fas fa-camera"></i> Upload Image (optional)
            </label>
          </div>
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <> <i className="fas fa-spinner fa-spin"></i> Submitting...</>
            ) : (
              <> <i className="fas fa-paper-plane"></i> Submit Alert</>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Report;