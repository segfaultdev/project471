import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { storesAPI, productsAPI } from '../api/api';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, Loader2 } from 'lucide-react';

const BulkImport = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [storesData, setStoresData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
                setError('Please upload an Excel file (.xlsx or .xls)');
                return;
            }
            setFile(selectedFile);
            setError('');
            parseExcel(selectedFile);
        }
    };

    const parseExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const storesSheet = workbook.Sheets['Stores'];
                if (storesSheet) {
                    const storesJson = XLSX.utils.sheet_to_json(storesSheet);
                    setStoresData(storesJson);
                } else {
                    setError('No "Stores" sheet found in the Excel file');
                }

                const productsSheet = workbook.Sheets['Products'];
                if (productsSheet) {
                    const productsJson = XLSX.utils.sheet_to_json(productsSheet);
                    setProductsData(productsJson);
                } else {
                    setError('No "Products" sheet found in the Excel file');
                }

            } catch (err) {
                setError('Failed to parse Excel file: ' + err.message);
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        setImporting(true);
        setError('');
        const importResults = {
            storesSuccess: 0,
            storesErrors: [],
            productsSuccess: 0,
            productsErrors: [],
                storeMapping: {}
        };

        try {
            for (let i = 0; i < storesData.length; i++) {
                const store = storesData[i];
                try {
                    const storeData = {
                        name: store['Store Name'] || store.name,
                        description: store['Description'] || store.description || '',
                        address: store['Address'] || store.address || '',
                        phone: store['Phone'] || store.phone || '',
                        email: store['Email'] || store.email || '',
                        slug: store['Slug'] || store.slug || generateSlug(store['Store Name'] || store.name),
                    };

                    const response = await storesAPI.create(storeData);
                    importResults.storesSuccess++;
                    importResults.storeMapping[storeData.name] = response.data.id;
                } catch (err) {
                    importResults.storesErrors.push({
                        row: i + 2,
                        store: store['Store Name'] || store.name,
                        error: err.response?.data?.message || err.message
                    });
                }
            }

            for (let i = 0; i < productsData.length; i++) {
                const product = productsData[i];
                try {
                    const storeName = product['Store Name'] || product.storeName;
                    const storeId = importResults.storeMapping[storeName];

                    if (!storeId) {
                        throw new Error(`Store "${storeName}" not found. Make sure store is created first.`);
                    }

                    const productData = {
                        name: product['Product Name'] || product.name,
                        description: product['Description'] || product.description || '',
                        price: parseFloat(product['Price'] || product.price || 0),
                        stock: parseInt(product['Stock'] || product.stock || 0),
                        categoryId: product['CategoryId'] || product['Category'] || product.categoryId || undefined,
                        weight: product['Weight'] ? parseFloat(product['Weight'] || product.weight) : undefined,
                        storeId: storeId,
                        images: []
                    };

                    await productsAPI.create(productData);
                    importResults.productsSuccess++;
                } catch (err) {
                    importResults.productsErrors.push({
                        row: i + 2,
                        product: product['Product Name'] || product.name,
                        error: err.response?.data?.message || err.message
                    });
                }
            }

            setResults(importResults);
        } catch (err) {
            setError('Import failed: ' + err.message);
        } finally {
            setImporting(false);
        }
    };

    const generateSlug = (name) => {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const downloadTemplate = () => {
        const storesWS = XLSX.utils.json_to_sheet([
            {
                'Store Name': 'Example Store',
                'Description': 'A great store selling quality products',
                'Address': '123 Main Street, City',
                'Phone': '+1234567890',
                'Email': 'store@example.com',
                'Slug': 'example-store'
            }
        ]);

        const productsWS = XLSX.utils.json_to_sheet([
            {
                'Store Name': 'Example Store',
                'Product Name': 'Sample Product',
                'Description': 'Product description here',
                'Price': 99.99,
                'Stock': 50,
                'CategoryId': 'electronics',
                'Weight': 1.5
            }
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, storesWS, 'Stores');
        XLSX.utils.book_append_sheet(wb, productsWS, 'Products');

        XLSX.writeFile(wb, 'shoplinker_import_template.xlsx');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Bulk Import</h1>
                    <p className="text-slate-600 mt-2">Import stores and products from Excel file</p>
                </div>

                
                <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">How to Use</h2>
                            <p className="text-slate-600">Follow these steps to import your data</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Download Template</h3>
                                <p className="text-slate-600 text-sm">Download our Excel template with the correct format and column headers</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Fill in Your Data</h3>
                                <p className="text-slate-600 text-sm">
                                    <strong>Sheet 1 - Stores:</strong> Store Name, Description, Address, Phone, Email, Slug<br />
                                    <strong>Sheet 2 - Products:</strong> Store Name, Product Name, Description, Price, Stock, Category, Weight
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Upload & Import</h3>
                                <p className="text-slate-600 text-sm">Upload your filled Excel file and click Import to add all data</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={downloadTemplate}
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        <Download className="h-5 w-5" />
                        Download Excel Template
                    </button>
                </div>

                
                <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Upload Excel File</h2>

                    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <input
                            type="file"
                            id="excelFile"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="excelFile" className="cursor-pointer">
                            <FileSpreadsheet className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-slate-700 mb-2">
                                {file ? file.name : 'Click to upload Excel file'}
                            </p>
                            <p className="text-sm text-slate-500">
                                Accepts .xlsx and .xls files
                            </p>
                        </label>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <p className="text-red-700 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </p>
                        </div>
                    )}
                </div>

                
                {(storesData.length > 0 || productsData.length > 0) && !results && (
                    <div className="space-y-6">
                        
                        {storesData.length > 0 && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    Stores Preview ({storesData.length})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="text-left p-3 font-semibold text-slate-700">Store Name</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Phone</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Slug</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {storesData.slice(0, 5).map((store, idx) => (
                                                <tr key={idx} className="border-b border-slate-100">
                                                    <td className="p-3">{store['Store Name'] || store.name}</td>
                                                    <td className="p-3 truncate max-w-xs">{store['Description'] || store.description}</td>
                                                    <td className="p-3">{store['Phone'] || store.phone}</td>
                                                    <td className="p-3">{store['Slug'] || store.slug || generateSlug(store['Store Name'] || store.name)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {storesData.length > 5 && (
                                        <p className="text-sm text-slate-500 mt-3">...and {storesData.length - 5} more stores</p>
                                    )}
                                </div>
                            </div>
                        )}

                        
                        {productsData.length > 0 && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    Products Preview ({productsData.length})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="text-left p-3 font-semibold text-slate-700">Store Name</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Product Name</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Price</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Stock</th>
                                                <th className="text-left p-3 font-semibold text-slate-700">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productsData.slice(0, 5).map((product, idx) => (
                                                <tr key={idx} className="border-b border-slate-100">
                                                    <td className="p-3">{product['Store Name'] || product.storeName}</td>
                                                    <td className="p-3">{product['Product Name'] || product.name}</td>
                                                    <td className="p-3">${product['Price'] || product.price}</td>
                                                    <td className="p-3">{product['Stock'] || product.stock}</td>
                                                    <td className="p-3">{product['CategoryId'] || product.categoryId}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {productsData.length > 5 && (
                                        <p className="text-sm text-slate-500 mt-3">...and {productsData.length - 5} more products</p>
                                    )}
                                </div>
                            </div>
                        )}

                        
                        <div className="flex gap-4">
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        Start Import
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    setFile(null);
                                    setStoresData([]);
                                    setProductsData([]);
                                    setError('');
                                }}
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                
                {results && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Import Complete</h2>
                        </div>

                        <div className="space-y-6">
                            
                            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-2xl">
                                <h3 className="font-bold text-green-900 mb-2">Stores Imported</h3>
                                <p className="text-green-700">
                                    Successfully imported {results.storesSuccess} out of {storesData.length} stores
                                </p>
                                {results.storesErrors.length > 0 && (
                                    <div className="mt-3">
                                        <p className="font-semibold text-red-700 mb-2">Errors:</p>
                                        {results.storesErrors.map((err, idx) => (
                                            <p key={idx} className="text-sm text-red-600">
                                                Row {err.row} ({err.store}): {err.error}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            
                            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-2xl">
                                <h3 className="font-bold text-blue-900 mb-2">Products Imported</h3>
                                <p className="text-blue-700">
                                    Successfully imported {results.productsSuccess} out of {productsData.length} products
                                </p>
                                {results.productsErrors.length > 0 && (
                                    <div className="mt-3">
                                        <p className="font-semibold text-red-700 mb-2">Errors:</p>
                                        {results.productsErrors.map((err, idx) => (
                                            <p key={idx} className="text-sm text-red-600">
                                                Row {err.row} ({err.product}): {err.error}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/my-stores')}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                                >
                                    View My Stores
                                </button>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setStoresData([]);
                                        setProductsData([]);
                                        setResults(null);
                                        setError('');
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Import Another File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkImport;
