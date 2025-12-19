import {useState} from 'react';
import axios from 'axios';

const AIForm = () => {
    const [budget, setBudget] = useState('');
    const [workPurpose, setWorkPurpose] = useState('');
    const [cpu, setCpu] = useState('');
    const [ram, setRam] = useState('');
    const [gpu, setGpu] = useState('');
    const [storage, setStorage] = useState('');
    const [brand, setBrand] = useState('');
    const [suggestedPrice, setSuggestedPrice] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5030/api/suggest-ai', {
                budget,
                workPurpose,
                cpu,
                ram,
                gpu,
                storage,
                brand
            });

            setSuggestedPrice(response.data.suggestedPrice);
        } catch (error) {
            console.error('Error fetching the suggested PC:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Budget: </label>
                <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Work Purpose: </label>
                <select value={workPurpose} onChange={(e) => setWorkPurpose(e.target.value)} required>
                    <option value="Gaming">Gaming</option>
                    <option value="Graphics Design">Graphics Design</option>
                    <option value="Office Work">Office Work</option>
                </select>
            </div>
            <div>
                <label>CPU: </label>
                <input
                    type="text"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>RAM: </label>
                <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>GPU: </label>
                <input
                    type="text"
                    value={gpu}
                    onChange={(e) => setGpu(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Storage: </label>
                <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Brand: </label>
                <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Get Suggested PC</button>

            {suggestedPrice && <div>Suggested PC Price: {suggestedPrice} BDT</div>}
        </form>
    );
};

export default AIForm;
