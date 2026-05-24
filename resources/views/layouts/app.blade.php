<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Sentralog') - Sentralog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body { 
            background-color: #0e131f; 
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .bg-custom-card {
            background-color: #1a2333 !important;
        }
        .text-custom-muted {
            color: #8a99ad !important;
        }
        .border-custom-cyan {
            border-color: #38bdf8 !important;
        }
        .btn-custom-cyan {
            background-color: #38bdf8;
            color: #0e131f;
            font-weight: 600;
        }
        .btn-custom-cyan:hover {
            background-color: #0ea5e9;
            color: #0e131f;
        }
        .form-control-dark {
            background-color: #121824;
            border: 1px solid #2a374a;
            color: #ffffff;
        }
        .form-control-dark:focus {
            background-color: #121824;
            border-color: #38bdf8;
            color: #ffffff;
            box-shadow: 0 0 0 0.25px rgba(56, 189, 248, 0.5);
        }
    </style>
</head>
<body>

    @yield('content')

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>