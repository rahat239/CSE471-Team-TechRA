// frontend/src/pages/ManageBrands.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../api/brand.js';

const ManageBrands = () => {
    const [brands, setBrands] = useState([]);
    const [name, setName] = useState('');
    const [img, setImg] = useState('');
    const [busy, setBusy] = useState(false);

    const load = async () => {
        setBusy(true);
        const res = await getBrands();
        if (res?.status === 'success') setBrands(res.data || []);
        else toast.error(res?.message || 'Failed to load brands');
        setBusy(false);
    };
    useEffect(() => { load(); }, []);

    const onCreate = async () => {
        if (!name || !img) return toast.error('Name & Image URL required');
        setBusy(true);
        const res = await createBrand({ brandName: name, brandImg: img });
        setBusy(false);
        if (res?.status === 'success') {
            setBrands((b) => [...b, res.data]);
            setName(''); setImg('');
            toast.success('Brand created');
        } else toast.error(res?.message || 'Create failed');
    };

    const onEdit = async (b) => {
        const brandName = prompt('Brand name', b.brandName);
        if (brandName == null) return;
        const brandImg = prompt('Image URL', b.brandImg);
        if (brandImg == null) return;
        setBusy(true);
        const res = await updateBrand(b._id, { brandName, brandImg });
        setBusy(false);
        if (res?.status === 'success') {
            setBrands((arr) => arr.map((x) => (x._id === b._id ? res.data : x)));
            toast.success('Brand updated');
        } else toast.error(res?.message || 'Update failed');
    };

    const onDelete = async (id) => {
        if (!confirm('Delete this brand?')) return;
        setBusy(true);
        const res = await deleteBrand(id);
        setBusy(false);
        if (res?.status === 'success') {
            setBrands((arr) => arr.filter((x) => x._id !== id));
            toast.success('Brand deleted');
        } else toast.error(res?.message || 'Delete failed');
    };

    return (
        <div className="container-fluid py-4">
            <div className="card dashboard-card mb-3">
                <div className="card-header bg-white border-0"><h6 className="m-0">Create Brand</h6></div>
                <div className="card-body d-flex gap-2">
                    <input className="form-control" placeholder="Brand name" value={name} onChange={(e)=>setName(e.target.value)} />
                    <input className="form-control" placeholder="Image URL" value={img} onChange={(e)=>setImg(e.target.value)} />
                    <button className="btn btn-success" onClick={onCreate} disabled={busy}>{busy?'Saving…':'Add'}</button>
                </div>
            </div>

            <div className="card dashboard-card">
                <div className="card-header bg-white border-0"><h6 className="m-0">Brands</h6></div>
                <div className="card-body">
                    {busy && brands.length===0 && <div>Loading…</div>}
                    <div className="row g-3">
                        {brands.map((b)=>(
                            <div key={b._id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm">
                                    <img src={b.brandImg} alt={b.brandName} className="card-img-top" style={{height:140,objectFit:'cover'}}/>
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className="fw-semibold">{b.brandName}</div>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-primary" onClick={()=>onEdit(b)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(b._id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {brands.length===0 && !busy && <div className="text-muted">No brands</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ManageBrands;
