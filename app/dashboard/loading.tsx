export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-gray-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-sm text-gray-400">Carregando painel...</p>
            </div>
        </div>
    );
}
