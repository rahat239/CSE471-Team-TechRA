// frontend/src/pages/ManageCategories.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/admin';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [img, setImg] = useState('');
    const [busy, setBusy] = useState(false);

    const load = async () => {
        setBusy(true);
        const res = await getCategories();
        if (res?.status === 'success') setCategories(res.data || []);
        else toast.error(res?.message || 'Failed to load categories');
        setBusy(false);
    };
    useEffect(() => { load(); }, []);

    const onCreate = async () => {
        if (!name || !img) return toast.error('Name & Image URL required');
        setBusy(true);
        const res = await createCategory({ categoryName: name, categoryImg: img });
        setBusy(false);
        if (res?.status === 'success') {
            setCategories((c) => [...c, res.data]);
            setName(''); setImg('');
            toast.success('Category created');
        } else toast.error(res?.message || 'Create failed');
    };

    const onEdit = async (c) => {
        const categoryName = prompt('Category name', c.categoryName);
        if (categoryName == null) return;
        const categoryImg = prompt('Image URL', c.categoryImg);
        if (categoryImg == null) return;
        setBusy(true);
        const res = await updateCategory(c._id, { categoryName, categoryImg });
        setBusy(false);
        if (res?.status === 'success') {
            setCategories((arr) => arr.map((x) => (x._id === c._id ? res.data : x)));
            toast.success('Category updated');
        } else toast.error(res?.message || 'Update failed');
    };

    const onDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        setBusy(true);
        const res = await deleteCategory(id);
        setBusy(false);
        if (res?.status === 'success') {
            setCategories((arr) => arr.filter((x) => x._id !== id));
            toast.success('Category deleted');
        } else toast.error(res?.message || 'Delete failed');
    };

    return (
        <div className="container-fluid py-4">
            <div className="card dashboard-card mb-3">
                <div className="card-header bg-white border-0"><h6 className="m-0">Create Category</h6></div>
                <div className="card-body d-flex gap-2">
                    <input className="form-control" placeholder="Category name" value={name} onChange={(e)=>setName(e.target.value)} />
                    <input className="form-control" placeholder="Image URL" value={img} onChange={(e)=>setImg(e.target.value)} />
                    <button className="btn btn-success" onClick={onCreate} disabled={busy}>{busy?'Saving…':'Add'}</button>
                </div>
            </div>

            <div className="card dashboard-card">
                <div className="card-header bg-white border-0"><h6 className="m-0">Categories</h6></div>
                <div className="card-body">
                    {busy && categories.length===0 && <div>Loading…</div>}
                    <div className="row g-3">
                        {categories.map((c)=>(
                            <div key={c._id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm">
                                    <img src={c.categoryImg} alt={c.categoryName} className="card-img-top" style={{height:140,objectFit:'cover'}}/>
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className="fw-semibold">{c.categoryName}</div>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-primary" onClick={()=>onEdit(c)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(c._id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {categories.length===0 && !busy && <div className="text-muted">No categories</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ManageCategories;
