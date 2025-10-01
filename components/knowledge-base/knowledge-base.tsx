"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getKnowledgeCategories,
  getKnowledgeArticles,
  getArticlesByCategory,
  searchArticles,
  getArticleById,
  incrementArticleViews,
  rateArticle,
  getTrendingArticles,
  getRelatedArticles,
  type KnowledgeArticle,
  type KnowledgeCategory,
} from "@/lib/knowledge-base"
import {
  Search,
  BookOpen,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Wifi,
  Monitor,
  HardDrive,
  Shield,
  Mail,
  Smartphone,
  Clock,
  User,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"

const iconMap = {
  Wifi,
  Monitor,
  HardDrive,
  Shield,
  Mail,
  Smartphone,
}

export function KnowledgeBase() {
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [view, setView] = useState<"categories" | "articles" | "article">("categories")
  const [trendingArticles, setTrendingArticles] = useState<KnowledgeArticle[]>([])

  useEffect(() => {
    setCategories(getKnowledgeCategories())
    setArticles(getKnowledgeArticles())
    setFilteredArticles(getKnowledgeArticles())
    setTrendingArticles(getTrendingArticles(5))
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const results = searchArticles(searchTerm)
      setFilteredArticles(results)
      setView("articles")
      setSelectedCategory(null)
    } else if (selectedCategory) {
      const categoryArticles = getArticlesByCategory(selectedCategory)
      setFilteredArticles(categoryArticles)
    } else {
      setFilteredArticles(articles)
    }
  }, [searchTerm, selectedCategory, articles])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setView("articles")
    setSearchTerm("")
  }

  const handleArticleClick = (articleId: string) => {
    const article = getArticleById(articleId)
    if (article) {
      incrementArticleViews(articleId)
      setSelectedArticle(article)
      setView("article")
    }
  }

  const handleBackToCategories = () => {
    setView("categories")
    setSelectedCategory(null)
    setSearchTerm("")
    setFilteredArticles(articles)
  }

  const handleBackToArticles = () => {
    setView("articles")
    setSelectedArticle(null)
  }

  const handleRateArticle = (helpful: boolean) => {
    if (selectedArticle) {
      rateArticle(selectedArticle.id, helpful)
      // Refresh the article data
      const updatedArticle = getArticleById(selectedArticle.id)
      if (updatedArticle) {
        setSelectedArticle(updatedArticle)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">Find answers to common IT questions and issues</p>
        </div>
        {view !== "categories" && (
          <Button variant="outline" onClick={view === "article" ? handleBackToArticles : handleBackToCategories}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {view === "article" ? "Back to Articles" : "Back to Categories"}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {view === "categories" && (
        <>
          {/* Trending Articles Section */}
          {trendingArticles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Trending Articles</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trendingArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{article.views}</span>
                        <ThumbsUp className="h-3 w-3 ml-2" />
                        <span>{article.helpful}</span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <CategoriesView categories={categories} onCategoryClick={handleCategoryClick} />
        </>
      )}

      {view === "articles" && (
        <ArticlesView
          articles={filteredArticles}
          selectedCategory={selectedCategory}
          categories={categories}
          onArticleClick={handleArticleClick}
          searchTerm={searchTerm}
        />
      )}

      {view === "article" && selectedArticle && (
        <ArticleView article={selectedArticle} onRate={handleRateArticle} onArticleClick={handleArticleClick} />
      )}
    </div>
  )
}

function CategoriesView({
  categories,
  onCategoryClick,
}: {
  categories: KnowledgeCategory[]
  onCategoryClick: (categoryId: string) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const IconComponent = iconMap[category.icon as keyof typeof iconMap] || BookOpen
        return (
          <Card
            key={category.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCategoryClick(category.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {category.articleCount} articles
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{category.description}</CardDescription>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ArticlesView({
  articles,
  selectedCategory,
  categories,
  onArticleClick,
  searchTerm,
}: {
  articles: KnowledgeArticle[]
  selectedCategory: string | null
  categories: KnowledgeCategory[]
  onArticleClick: (articleId: string) => void
  searchTerm: string
}) {
  const categoryName = selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : null

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          {searchTerm ? (
            <h3 className="text-lg font-semibold">
              Search results for "{searchTerm}" ({articles.length} found)
            </h3>
          ) : categoryName ? (
            <h3 className="text-lg font-semibold">
              {categoryName} ({articles.length} articles)
            </h3>
          ) : (
            <h3 className="text-lg font-semibold">All Articles ({articles.length})</h3>
          )}
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Try adjusting your search terms or browse by category"
                : "No articles available in this category"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onArticleClick(article.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg hover:text-primary transition-colors">{article.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(article.updatedAt, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.views} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline" className="text-xs">
                      {categories.find((c) => c.id === article.category)?.name || article.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{article.helpful}</span>
                      <ThumbsDown className="h-3 w-3 ml-2" />
                      <span>{article.notHelpful}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.content.substring(0, 200)}...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ArticleView({
  article,
  onRate,
  onArticleClick,
}: {
  article: KnowledgeArticle
  onRate: (helpful: boolean) => void
  onArticleClick: (articleId: string) => void
}) {
  const [hasRated, setHasRated] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState<KnowledgeArticle[]>([])

  useEffect(() => {
    setRelatedArticles(getRelatedArticles(article.id, 3))
  }, [article.id])

  const handleRate = (helpful: boolean) => {
    if (!hasRated) {
      onRate(helpful)
      setHasRated(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Article Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {format(article.updatedAt, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.views} views</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{article.category}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Was this article helpful?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={hasRated ? "secondary" : "outline"}
              onClick={() => handleRate(true)}
              disabled={hasRated}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Yes ({article.helpful})
            </Button>
            <Button
              variant={hasRated ? "secondary" : "outline"}
              onClick={() => handleRate(false)}
              disabled={hasRated}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              No ({article.notHelpful})
            </Button>
          </div>
          {hasRated && <p className="text-sm text-muted-foreground mt-2">Thank you for your feedback!</p>}
        </CardContent>
      </Card>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedArticles.map((relatedArticle) => (
                <div
                  key={relatedArticle.id}
                  className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onArticleClick(relatedArticle.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{relatedArticle.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{relatedArticle.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{relatedArticle.helpful}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {relatedArticle.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
