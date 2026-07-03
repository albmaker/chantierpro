import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight, Search } from 'lucide-react'
import { BLOG_POSTS, getPostBySlug, getRelatedPosts } from '../data/blogPosts'

// ============================================
// PAGE LISTING BLOG
// ============================================
export function BlogList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'plomberie', label: 'Plomberie' },
    { id: 'electricite', label: 'Électricité' },
    { id: 'peinture', label: 'Peinture' },
    { id: 'maconnerie', label: 'Maçonnerie' },
    { id: 'business', label: 'Business' },
  ]

  const filtered = BLOG_POSTS.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-800 to-navy-900 px-5 py-8 border-b border-navy-700/50">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-sm text-gray-400">← Accueil</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Blog ChantierPro</h1>
        <p className="text-gray-300">Conseils, guides & actualités pour les artisans BTP</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un article..."
            className="input pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex gap-2 pb-1 -mx-1 px-1">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                category === c.id
                  ? 'bg-chantier text-white'
                  : 'bg-navy-700 text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="px-5 space-y-4">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Aucun article trouvé</p>
        ) : (
          filtered.map(post => (
            <article
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="card cursor-pointer hover:bg-navy-600/80 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{post.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-chantier/20 text-chantier text-[10px]">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime} min
                    </span>
                  </div>
                  <h2 className="font-bold text-white text-lg leading-tight mb-1">{post.title}</h2>
                  <p className="text-sm text-gray-300 line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// PAGE ARTICLE
// ============================================
export function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = getPostBySlug(slug)
  const related = post ? getRelatedPosts(post, 3) : []

  useEffect(() => {
    if (post) {
      document.title = `${post.title} · ChantierPro`
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.content = post.excerpt
    }
  }, [post])

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p className="text-white">Article introuvable</p>
        <button onClick={() => navigate('/blog')} className="btn-primary mt-4">
          Retour au blog
        </button>
      </div>
    )
  }

  return (
    <article className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-800 to-navy-900 px-5 py-6 border-b border-navy-700/50">
        <button
          onClick={() => navigate('/blog')}
          className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center mb-4"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-5xl mb-3">{post.emoji}</div>
        <span className="badge bg-chantier/20 text-chantier text-xs">
          {post.category}
        </span>
        <h1 className="text-3xl font-bold text-white mt-2 mb-3 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {post.date}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {post.readTime} min de lecture
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 max-w-3xl mx-auto">
        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA in-article */}
        <div className="card bg-gradient-to-br from-chantier to-chantier-dark text-white mt-8">
          <h3 className="text-xl font-bold mb-2">Génère tes devis en 2 min 🚀</h3>
          <p className="text-white/90 text-sm mb-3">
            Scan IA, PDF conformes FE 2026, multi-TVA... essaie ChantierPro gratuitement.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white text-chantier font-semibold py-2 px-4 rounded-xl text-sm"
          >
            Démarrer gratuitement →
          </button>
        </div>

        {/* Articles liés */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-3">📚 À lire aussi</h3>
            <div className="space-y-2">
              {related.map(p => (
                <button
                  key={p.slug}
                  onClick={() => navigate(`/blog/${p.slug}`)}
                  className="w-full card text-left hover:bg-navy-600/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{p.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.readTime} min · {p.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
